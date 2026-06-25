import * as functions from 'firebase-functions/v1'
import * as admin from 'firebase-admin'

admin.initializeApp()

const db = admin.firestore()
const messaging = admin.messaging()

/**
 * Scheduled Cloud Function that sends daily notifications to users
 * with incomplete todos for today.
 *
 * Runs daily at 8 AM (configurable timezone).
 */
export const sendDailyNotifications = functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    functions.logger.info('Starting daily notification job')

    try {
      // Get all users with FCM tokens
      const usersSnapshot = await db.collectionGroup('fcm_tokens').get()

      if (usersSnapshot.empty) {
        functions.logger.info('No users with FCM tokens found')
        return
      }

      // Group tokens by user ID
      const userTokens: Map<string, string[]> = new Map()

      for (const tokenDoc of usersSnapshot.docs) {
        const userId = tokenDoc.ref.parent.parent?.id
        if (userId) {
          if (!userTokens.has(userId)) {
            userTokens.set(userId, [])
          }
          userTokens.get(userId)!.push(tokenDoc.id)
        }
      }

      functions.logger.info(`Found ${userTokens.size} users with FCM tokens`)

      // Process each user
      const results = await Promise.allSettled(
        Array.from(userTokens.entries()).map(([userId, tokens]) =>
          processUser(userId, tokens)
        )
      )

      // Log summary
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      functions.logger.info(`Notifications sent: ${successful} successful, ${failed} failed`)

    } catch (error) {
      functions.logger.error('Error in daily notification job:', error)
      throw error
    }
  })

/**
 * Process a single user: count todos and send notification if needed
 */
async function processUser(userId: string, tokens: string[]): Promise<void> {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Count incomplete todos for today
    const todosRef = db.collection('users').doc(userId).collection('todos')
    const todosSnapshot = await todosRef
      .where('date', '==', today)
      .where('completed', '==', false)
      .get()

    const todoCount = todosSnapshot.size

    if (todoCount === 0) {
      functions.logger.info(`User ${userId} has no incomplete todos for today`)
      return
    }

    // Send notification to all user's tokens
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: 'Daily Planner',
        body: `You have ${todoCount} task${todoCount === 1 ? '' : 's'} to complete today!`,
      },
      data: {
        click_action: '/',
      },
      webpush: {
        notification: {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'daily-planner-notification',
        },
        fcmOptions: {
          link: '/',
        },
      },
    }

    const response = await messaging.sendEachForMulticast(message)

    functions.logger.info(
      `Sent ${response.successCount} notifications to user ${userId}`,
      { successCount: response.successCount, failureCount: response.failureCount }
    )

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = []
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx])
          functions.logger.warn(`Failed to send to token ${tokens[idx]}:`, resp.error)
        }
      })

      // Remove invalid tokens from Firestore
      await cleanupInvalidTokens(userId, failedTokens)
    }

  } catch (error) {
    functions.logger.error(`Error processing user ${userId}:`, error)
    throw error
  }
}

/**
 * Remove invalid FCM tokens from Firestore
 */
async function cleanupInvalidTokens(userId: string, tokens: string[]): Promise<void> {
  const batch = db.batch()

  for (const token of tokens) {
    const tokenRef = db.collection('users').doc(userId).collection('fcm_tokens').doc(token)
    batch.delete(tokenRef)
  }

  await batch.commit()
  functions.logger.info(`Cleaned up ${tokens.length} invalid tokens for user ${userId}`)
}
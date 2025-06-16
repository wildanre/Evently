import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.notifications.deleteMany();
  await prisma.event_feedback.deleteMany();
  await prisma.event_participants.deleteMany();
  await prisma.events.deleteMany();
  await prisma.users.deleteMany();

  // Create sample users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.users.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        bio: 'Event organizer and tech enthusiast. Love bringing people together through amazing events.',
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
      }
    }),
    prisma.users.create({
      data: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
        bio: 'Software developer and community builder. Passionate about technology and networking.',
        profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
      }
    }),
    prisma.users.create({
      data: {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        password: hashedPassword,
        bio: 'Marketing professional and event planner. Expert in creating engaging experiences.',
        profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
      }
    }),
    prisma.users.create({
      data: {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        password: hashedPassword,
        bio: 'UX designer and workshop facilitator. Love creating user-centered experiences.',
        profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
      }
    }),
    prisma.users.create({
      data: {
        name: 'David Brown',
        email: 'david.brown@example.com',
        password: hashedPassword,
        bio: 'Data scientist and AI researcher. Enthusiastic about sharing knowledge through talks.',
        profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample events
  console.log('🎉 Creating events...');
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const events = await Promise.all([
    prisma.events.create({
      data: {
        name: 'Tech Conference 2025',
        description: 'Annual technology conference featuring the latest trends in software development, AI, and cloud computing. Join industry leaders and innovators for a day of learning and networking.',
        location: 'Jakarta Convention Center',
        startDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 8 * 60 * 60 * 1000), // 8 hours later
        capacity: 500,
        tags: ['technology', 'conference', 'networking', 'ai', 'development'],
        visibility: true,
        requireApproval: false,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
        organizerId: users[0].id,
        status: 'PUBLISHED'
      }
    }),
    prisma.events.create({
      data: {
        name: 'UX/UI Design Workshop',
        description: 'Hands-on workshop covering modern UX/UI design principles, tools, and best practices. Perfect for beginners and intermediate designers looking to improve their skills.',
        location: 'Creative Hub Bandung',
        startDate: twoWeeksFromNow,
        endDate: new Date(twoWeeksFromNow.getTime() + 6 * 60 * 60 * 1000), // 6 hours later
        capacity: 50,
        tags: ['design', 'workshop', 'ux', 'ui', 'creative'],
        visibility: true,
        requireApproval: true,
        imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=400&fit=crop',
        organizerId: users[3].id,
        status: 'PUBLISHED'
      }
    }),
    prisma.events.create({
      data: {
        name: 'Startup Pitch Night',
        description: 'An exciting evening where promising startups pitch their ideas to investors and the community. Network with entrepreneurs, investors, and innovators.',
        location: 'Innovation Hub Surabaya',
        startDate: nextMonth,
        endDate: new Date(nextMonth.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
        capacity: 200,
        tags: ['startup', 'pitch', 'investment', 'networking', 'entrepreneurship'],
        visibility: true,
        requireApproval: false,
        imageUrl: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=800&h=400&fit=crop',
        organizerId: users[1].id,
        status: 'PUBLISHED'
      }
    }),
    prisma.events.create({
      data: {
        name: 'Digital Marketing Masterclass',
        description: 'Comprehensive masterclass covering SEO, social media marketing, content strategy, and digital advertising. Learn from industry experts.',
        location: 'Marketing Institute Jakarta',
        startDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days after nextWeek
        endDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 5 hours later
        capacity: 100,
        tags: ['marketing', 'digital', 'seo', 'social-media', 'advertising'],
        visibility: true,
        requireApproval: false,
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
        organizerId: users[2].id,
        status: 'PUBLISHED'
      }
    }),
    prisma.events.create({
      data: {
        name: 'AI & Machine Learning Summit',
        description: 'Deep dive into artificial intelligence and machine learning applications. Features talks from leading researchers and practitioners in the field.',
        location: 'Tech Park Yogyakarta',
        startDate: new Date(nextMonth.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week after nextMonth
        endDate: new Date(nextMonth.getTime() + 7 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000), // 7 hours later
        capacity: 300,
        tags: ['ai', 'machine-learning', 'data-science', 'technology', 'research'],
        visibility: true,
        requireApproval: true,
        imageUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=400&fit=crop',
        organizerId: users[4].id,
        status: 'PUBLISHED'
      }
    }),
    prisma.events.create({
      data: {
        name: 'Community Meetup: Web Development',
        description: 'Monthly meetup for web developers to share knowledge, discuss trends, and network. This month focusing on React, Node.js, and modern web technologies.',
        location: 'CoWorking Space Medan',
        startDate: tomorrow,
        endDate: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
        capacity: 75,
        tags: ['web-development', 'react', 'nodejs', 'community', 'meetup'],
        visibility: true,
        requireApproval: false,
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
        organizerId: users[1].id,
        status: 'PUBLISHED'
      }
    })
  ]);

  console.log(`✅ Created ${events.length} events`);

  // Create event participants
  console.log('👥 Creating event participants...');
  const participants: Array<Awaited<ReturnType<typeof prisma.event_participants.create>>> = [];

  // Register users for various events
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    // Register 2-4 random users for each event (excluding the organizer)
    const availableUsers = users.filter(user => user.id !== event.organizerId);
    const numParticipants = Math.floor(Math.random() * 3) + 2; // 2-4 participants
    
    for (let j = 0; j < numParticipants && j < availableUsers.length; j++) {
      const participant = await prisma.event_participants.create({
        data: {
          eventId: event.id,
          userId: availableUsers[j].id,
          role: 'ATTENDEE',
          status: 'confirmed'
        }
      });
      participants.push(participant);
      
      // Update attendee count
      await prisma.events.update({
        where: { id: event.id },
        data: { attendeeCount: { increment: 1 } }
      });
    }
  }

  console.log(`✅ Created ${participants.length} event participants`);

  // Create sample event feedback
  console.log('⭐ Creating event feedback...');
  const feedback: Array<Awaited<ReturnType<typeof prisma.event_feedback.create>>> = [];
  
  // Add feedback for past events (we'll use the first two events as "past")
  for (let i = 0; i < 2; i++) {
    const event = events[i];
    const eventParticipants = participants.filter(p => p.eventId === event.id);
    
    for (const participant of eventParticipants.slice(0, 2)) { // 2 feedback per event
      const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
      const comments = [
        'Great event! Learned a lot and met amazing people.',
        'Well organized and informative. Looking forward to the next one.',
        'Excellent speakers and content. Highly recommend!',
        'Good networking opportunities and valuable insights.',
        'Inspiring talks and great venue. Thank you for organizing!'
      ];
      
      const feedbackEntry = await prisma.event_feedback.create({
        data: {
          eventId: event.id,
          userId: participant.userId,
          rating,
          comment: comments[Math.floor(Math.random() * comments.length)]
        }
      });
      feedback.push(feedbackEntry);
      
      // Update feedback count and average rating
      const eventFeedback = await prisma.event_feedback.findMany({
        where: { eventId: event.id }
      });
      
      const avgRating = eventFeedback.reduce((sum, f) => sum + f.rating, 0) / eventFeedback.length;
      
      await prisma.events.update({
        where: { id: event.id },
        data: {
          feedbackCount: eventFeedback.length,
          feedbackAverageRating: avgRating
        }
      });
    }
  }

  console.log(`✅ Created ${feedback.length} feedback entries`);

  // Create sample notifications
  console.log('🔔 Creating notifications...');
  const notifications: Array<Awaited<ReturnType<typeof prisma.notifications.create>>> = [];
  
  // Create various types of notifications for users
  for (const user of users) {
    // Welcome notification
    const welcomeNotification = await prisma.notifications.create({
      data: {
        title: 'Welcome to Evently!',
        message: 'Thank you for joining Evently! Discover amazing events and connect with like-minded people in your community.',
        type: 'GENERAL',
        userId: user.id,
        isRead: Math.random() > 0.5 // Randomly set some as read
      }
    });
    notifications.push(welcomeNotification);
    
    // Event-related notifications for participants
    const userParticipations = participants.filter(p => p.userId === user.id);
    
    for (const participation of userParticipations) {
      const event = events.find(e => e.id === participation.eventId);
      
      // Registration confirmation
      const regConfirmation = await prisma.notifications.create({
        data: {
          title: 'Registration Confirmed',
          message: `Your registration for "${event?.name}" has been confirmed. We look forward to seeing you there!`,
          type: 'REGISTRATION_CONFIRMED',
          userId: user.id,
          eventId: event?.id,
          isRead: Math.random() > 0.3
        }
      });
      notifications.push(regConfirmation);
      
      // Event reminder (for upcoming events)
      if (event && event.startDate > now) {
        const reminder = await prisma.notifications.create({
          data: {
            title: 'Event Reminder',
            message: `Don't forget! "${event.name}" is coming up soon. Make sure to mark your calendar.`,
            type: 'EVENT_REMINDER',
            userId: user.id,
            eventId: event.id,
            isRead: Math.random() > 0.7
          }
        });
        notifications.push(reminder);
      }
    }
    
    // Feedback request for attended events
    const attendedEvents = participants
      .filter(p => p.userId === user.id)
      .slice(0, 1); // Just one feedback request per user
      
    for (const participation of attendedEvents) {
      const event = events.find(e => e.id === participation.eventId);
      
      const feedbackRequest = await prisma.notifications.create({
        data: {
          title: 'Share Your Feedback',
          message: `How was "${event?.name}"? We'd love to hear your thoughts and feedback about the event.`,
          type: 'FEEDBACK_REQUEST',
          userId: user.id,
          eventId: event?.id,
          isRead: Math.random() > 0.6
        }
      });
      notifications.push(feedbackRequest);
    }
  }
  
  // Create notifications for event organizers
  for (const event of events) {
    const organizer = users.find(u => u.id === event.organizerId);
    
    const eventCreated = await prisma.notifications.create({
      data: {
        title: 'Event Created Successfully',
        message: `Your event "${event.name}" has been created and published successfully. Start promoting it to get attendees!`,
        type: 'EVENT_CREATED',
        userId: organizer!.id,
        eventId: event.id,
        isRead: Math.random() > 0.4
      }
    });
    notifications.push(eventCreated);
  }

  console.log(`✅ Created ${notifications.length} notifications`);

  // Summary
  console.log('\n📊 Seeding Summary:');
  console.log(`👥 Users: ${users.length}`);
  console.log(`🎉 Events: ${events.length}`);
  console.log(`🎫 Participants: ${participants.length}`);
  console.log(`⭐ Feedback: ${feedback.length}`);
  console.log(`🔔 Notifications: ${notifications.length}`);
  console.log('\n✨ Database seeding completed successfully!');
  
  console.log('\n🔑 Test Credentials:');
  console.log('Email: john.doe@example.com');
  console.log('Email: jane.smith@example.com');
  console.log('Email: mike.johnson@example.com');
  console.log('Email: sarah.wilson@example.com');
  console.log('Email: david.brown@example.com');
  console.log('Password: password123 (for all users)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


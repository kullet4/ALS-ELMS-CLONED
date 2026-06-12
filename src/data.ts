import { Lesson, UserEnrollment, StudentAlert, StudentInsight } from './types';

export const AVATAR_URLS = {
  learnerBlue: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsGVNiVhzIPPMVolNChVsKKR6EuZO-WNMPVY327jCsYxFo2_StFMqQxK95ADWWmpRn--DsmqFtfktkBqJIy_ObTdq-CUxcisFdo9iuVOP57MsQi2NTpvgeb9c3vlIvy9AQUmjbMFh9yBV60KmHdy808Qt1fAF7jYgDul8K_Ffw11t9TKM9vPsEEsB_tQ4O_GFqcZrSAg5wCbV_ujHvudpXjwKJqvD2RML1SlM3E0n78_bcJNjkG-zVkkyrMBlVhs8GqJPhvl_cZqw',
  learner3D: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjXdY1PpfUPhEAQAsLUDCkP9KqcpSbn-IViF0_4HLM1JSF4fuXEtqrEj7Drp-DNBlPlGycNmj1-bWCXWsMgFIHcMOss0k1cCFDKnZp3zxkU4wf2pzgPTCIAEj-Ck6hpXF9Rfo5qJga-9wy98WIIdxLmahY7WpMzbxpe2bzB8qxezAJdwnO9edc-50kKo5XsPaldNhk9DBLyOSsbDHxVtRnouTzq1zanZOgyY17rDBxRbkpwaWlbFbWEP5omeFyWc5iTIoIA_aZdTA',
  mentorMarcus: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5zEWvuPwC_wCN2-lS4UpnHJsh5jJaktIRB91o9cS3bYd0ZQ8-toQUK5U9zvZucWUGdfQ4fPDwCAB4B3XdCDUmLMFP71ZjWiF5vvHVt8nVOWU7aNzhrrnmH5VioqfEELw9wDLa3ZYUVeErHUcPB2q7p1DMCeqp8DbnpIQnK1tOqfm7xpYKUnEhmG13hPoVu3S6dpJJiyoy0ZuPyu9Z2wYl93YyufEDjRRuvKjVYm8ZdiZ83ZyIv6H0DMI3-16AByQF3e0wDvEXykM',
  mentorFemale: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEIPUtq0rxnuoGt-glgQmr3mvVvmpNKOo49GkruV_KT49NimM6ixxBIevlIrfdEng6fyDb-fd_Ic9F64POS24bHvEMH4-tjz5ZPlcRoizGH_u2I-ZJ_GLh1k0bnfqe919-ERsp_YQClcTYBBKlZwb9Uyx0t2agxIsTDvhvIbn0npm2pGjba7y8ieYlJNwG5_QRcSEbotswPSFtwK8dp79MMBghTvBy1Zr7rnrtdkeXtQA6QTjdMOa5F3GYJ4IqmebTHTxFEPmKehk',
  juan: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2HrNLup1TlYEMarXDaOMhz23PrIRZJTqcKCv7aFL1eDT2ejcyZawMlJCDF8um7HJWLiNic__Z07-rGsh0n5Ctu5nLbBL1HAOH8PhWyOqhgF5Kneu1IowmprPLw86hbxw1A2tERvIQm0z5JwTOvPTBtwi3pdHH9edFfRQyl1l14xlTmRm9WgGn19G6B1pGF1M7mM_yJB1Am4xwOITUs9s2_JOLuGSAIdpUUHazXGFWpbsqqgJ1nKeN2Z702l35yvEEUlPSnNJ90fk',
  mariaClara: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8Uft_h0RQ8VWRHbcY26jXUve8uRXHAJPPO8WO0ePVrlf8Ke2R28afOa_fhAZG3q5TRRW1TaYbevV24kbMaQSsidNRkMpRFq2dfAaVwuOOMfyrKC7_2AC7olwN7nQrstWtmMc4Xhs_QFDf2w_nvniyPwCe-qM6CMSVhU3Kppn06aum3hUa_NcMmkWGQg8o9mIRPE_0lL6Bffw7IuvLGzmu9XLjlJCw6ZN4MnCxQPSHAHb8LwhqNc76xtiPzh_5fu112LE1OdZ2ub4'
};

export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'eng-reality-fantasy',
    title: 'Real or Make-Believe?',
    category: 'English',
    level: 1,
    duration: '10 mins',
    description: 'Learning Strand 1: Communication Skills. Learn to determine and distinguish whether story events are Reality or Fantasy.',
    progress: 0,
    assetUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&auto=format&fit=crop&q=60',
    rewardText: 'Elementary Level Complete',
    parts: [
      {
        title: 'Reality vs. Fantasy (What\'s New)',
        content: `ALTERNATIVE LEARNING SYSTEM (ALS)
Learning Activity Sheets (Learning Strand 1)
Communication Skills (English)

Determine and Distinguish whether an event is a Reality or a Fantasy / Make-Believe.

✨ WHAT IS REALITY?
Reality is based on what is real. Things that are real are facts that can be proven and experienced with our five senses (seeing, hearing, tasting, touching, smelling).

💡 Examples of Reality:
- The sun rises in the east.
- A boy wakes up early and prepares for school.

🦄 WHAT IS FANTASY / MAKE-BELIEVE?
Fantasy is make-believe. It comes from our fertile imagination and is not true. These stories, events, and images are often exaggerated and impossible to prove in real life.

💡 Examples of Fantasy:
- A turtle learns to fly and joins a superhero team.
- Water from a flood almost reaches the clouds.

📝 CRITICAL TIP FOR SUCCESS:
Ask yourself: "Could this event truly happen in real life?" If yes, it is Reality. If no, it is Fantasy / Make-Believe.`
      },
      {
        title: 'Interactive Activity (Give this a try!)',
        content: 'Activity 2: Look at each card below. Decide if the situation represents Reality (can actually happen) or Fantasy (make-believe / imaginary). Select your choice to see instant feedback!'
      }
    ],
    quiz: {
      question: 'Which of the following events represents an example of FANTASY?',
      options: [
        'A. A family goes on a picnic in the park.',
        'B. A superhero flies directly into the hot sun.',
        'C. A student reads a textbook at the community center.'
      ],
      correctAnswer: 'B',
      explanation: 'Excellent! Flying into the sun is a superhero fantasy and impossible in real life. Picnics and reading books are reality. You have mastered LS1 reality concepts! +100 Coins added!'
    }
  },
  {
    id: 'mat-1',
    title: 'Understanding Big Numbers',
    category: 'Math',
    level: 1,
    duration: '20 mins',
    description: 'Learn the fundamentals of representing large numbers, decimal place values, and read/write large numerals correctly in daily life.',
    progress: 25,
    assetUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMG5BPSp6RF1_qWoB091w0NCI-dfBgRJ48uICFHwNMdJF7HvO-oLb6he03CyyHUZgbhbLYo-CVTS58lgV4TvcpLeqPE0Krh7CEfrt6LXJJqjuYPQPmbSi_jZkRh8AvDwa1zQk0NZYFmJW8HxX4SxWK5txhS4Inqn3H_eT8MIxxVzAew3iCB7tqD9d1G_otijNVkoVpcUnptR2BQoChQYHchioHEPzHQoejGGyAWAQCMRTNWVPHrPG52QTxGZGu3KWipkTE8pA-KRE',
    rewardText: '25% Started'
  },
  {
    id: 'sci-2',
    title: 'The Secret Life of Plants',
    category: 'Science',
    level: 2,
    duration: '15 mins',
    description: 'Explore plant processes like photosynthesis, osmosis, transpiration, and learn how local flora supports oxygen levels and local farming.',
    progress: 0,
    assetUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJyvH30uHe26QqhBfpDQuAHjwoyAs1BdvCupuu9Snf3yjhNLq2y3vT35OvoYoFyCU5aVXhCmVGSJ8rmHepnIAcFRkcXOURqyxc0ItCZRWS31xbLTwTRR4amXaHdh1l0mu6m_rNmI21EZ5SX11eafxQ4x9j79WVXaRBhtHf2amoGNcuw0r0EIL90HGJhzCzyC7ivJcYUHSVVgBlUmxEgECDMXhocbOjuErgQdmoJhW0mOVBc0xDGyEODHmMnUoPM_bjUaJzOvuTrqw',
    rewardText: '15 mins'
  },
  {
    id: 'eng-1',
    title: 'Building Better Sentences',
    category: 'English',
    level: 1,
    duration: '18 mins',
    description: 'Master structure essentials: nouns, verbs, predicates and common punctuation that elevate your communicative and speaking potential.',
    progress: 0,
    assetUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE-BXqQ6EFQrGv_0bveAFQxNdS7gHxRL7lylGFTiHeFky1sDUWHx0mb6Z9IpFzxuGDSveJ2x4eLQBwBg3ch-P_K18lhkMyIBxNXlp3I_3pb-n8ZPAkh_XWALD4UsgPS35R1RT10wyhjc9yViAD5lI_9JwPyRTtupqqNFJfsxJ1ayFfOnZDNLJplGBJup0DgUbtXIcwjhBtoFewNEG5vLlUjcgO40xuTbvlWZMXbQcZrAHUkOmNm-HHFzWzeHNTrNyu1ni54fAfbzI',
    rewardText: 'New Bonus Lesson'
  },
  {
    id: 'lif-3',
    title: 'Helping Your Community',
    category: 'Life Skills',
    level: 3,
    duration: '25 mins',
    description: 'Understand civic responsibilities, leadership models, disaster mitigation, and collaborative volunteer strategies to build stronger towns.',
    progress: 0,
    assetUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Ihbn1lS_HTUSu-zs16FbWWUuduAHmNw9n8gduDhzNFkUWtQA3cKPDILlwaImvQFiobuGr92qXQoSdAEIeS5Ve3KpljYn7ZCHdl0ICIEoSGSg-yVtHs7AX9f7xw-cpuGTIydGuDURzJUbLFMyJ74tvRK3GReLLbMcRCckUdlcggoeheOmEvarwotbxEq2G-JRjcy_Btc2_KFovY1Drp6ot6x4VdBy8mKeLc0s0IIjYdx74lQkjFpAI5sms9oGh4lwABE0wjWMJx0',
    rewardText: 'Certification Path'
  },
  {
    id: 'learning-active',
    title: 'Ecosystems and Balance',
    category: 'Science',
    level: 2,
    duration: '12:45 mins',
    description: 'An ecosystem is a community of living organisms in conjunction with the nonliving components of their environment, interacting as a system. These biotic and abiotic components are linked together through nutrient cycles and energy flows.',
    progress: 45,
    assetUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTdnkTbMTcfe3EVpE_WFb-IYjbHjlc4Fj5n4PJskLfJ___muUVwBSnaRauufk7tpubRtemsghf2lYhK5n9zeuVhwVoUpgVLQPxWyAPvK1CWuaxlSft8EjSu540sjYYwEcdLBWSQZm7alxidVQKeYXDbKGIXHEllNQf9Ff2WBqDA6MhtFcaKhbcLQVmV4OuY2Iw9Une1gnaWnpgQxJXjWHvI8i2v3MiICz8loe066Bq0COU8PorEljLV4Q03f3At381AR9gw4nJ1GY',
    rewardText: 'Module Progress'
  }
];

export const MOCK_USER_ENROLLMENTS: UserEnrollment[] = [
  {
    id: 'usr-1',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    role: 'Student',
    program: 'Basic Literacy',
    joined: '2 hours ago',
    status: 'Active',
    initials: 'AJ',
    colorScheme: 'text-blue-600 bg-blue-100'
  },
  {
    id: 'usr-2',
    name: 'Maria Santos',
    email: 'maria.s@example.com',
    role: 'Teacher',
    program: 'Alternative Secondary',
    joined: '5 hours ago',
    status: 'Active',
    initials: 'MS',
    colorScheme: 'text-emerald-600 bg-emerald-100'
  },
  {
    id: 'usr-3',
    name: 'Robert Lim',
    email: 'rob.lim@example.com',
    role: 'Student',
    program: 'Digital Literacy',
    joined: 'Yesterday',
    status: 'Pending',
    initials: 'RL',
    colorScheme: 'text-amber-600 bg-amber-100'
  }
];

export const MOCK_STUDENT_ALERTS: StudentAlert[] = [
  {
    id: 'alt-1',
    title: '12 Submissions Pending',
    description: 'Due: Science Module 3',
    type: 'pending',
    icon: 'assignment_late'
  },
  {
    id: 'alt-2',
    title: 'New Forum Post',
    description: 'Ana Santos asked about Algebra...',
    type: 'post',
    icon: 'forum'
  },
  {
    id: 'alt-3',
    title: 'Class Milestone!',
    description: 'Grade 4 achieved 100% attendance',
    type: 'milestone',
    icon: 'celebration'
  }
];

export const MOCK_STUDENT_INSIGHTS: StudentInsight[] = [
  {
    id: 'ins-1',
    name: 'Juan Dela Cruz',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2HrNLup1TlYEMarXDaOMhz23PrIRZJTqcKCv7aFL1eDT2ejcyZawMlJCDF8um7HJWLiNic__Z07-rGsh0n5Ctu5nLbBL1HAOH8PhWyOqhgF5Kneu1IowmprPLw86hbxw1A2tERvIQm0z5JwTOvPTBtwi3pdHH9edFfRQyl1l14xlTmRm9WgGn19G6B1pGF1M7mM_yJB1Am4xwOITUs9s2_JOLuGSAIdpUUHazXGFWpbsqqgJ1nKeN2Z702l35yvEEUlPSnNJ90fk',
    subject: 'Mathematics',
    status: 'Struggling with Division',
    statusType: 'struggling',
    score: 45
  },
  {
    id: 'ins-2',
    name: 'Maria Clara',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8Uft_h0RQ8VWRHbcY26jXUve8uRXHAJPPO8WO0ePVrlf8Ke2R28afOa_fhAZG3q5TRRW1TaYbevV24kbMaQSsidNRkMpRFq2dfAaVwuOOMfyrKC7_2AC7olwN7nQrstWtmMc4Xhs_QFDf2w_nvniyPwCe-qM6CMSVhU3Kppn06aum3hUa_NcMmkWGQg8o9mIRPE_0lL6Bffw7IuvLGzmu9XLjlJCw6ZN4MnCxQPSHAHb8LwhqNc76xtiPzh_5fu112LE1OdZ2ub4',
    subject: 'Communication Arts',
    status: 'Mastery Achieved',
    statusType: 'mastered',
    score: 98
  }
];

export const MOCK_TIPS = [
  "Taking a 5-minute break helps your brain remember more of what you've learned! ✨",
  "Try explaining a hard concept to an imaginary friend. Teaching is the best form of learning!",
  "Reviewing your notes right before sleeping helps memory consolidation significantly.",
  "Start with the hardest task first when your energy levels are highest!"
];

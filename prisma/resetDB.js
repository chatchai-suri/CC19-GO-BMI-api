require('dotenv').config()
const prisma = require('../config/prisma')

// beware oder of table deletion
async function resetDatabase() {
  await prisma.$transaction([
    prisma.weeklyPlan.deleteMany(),
    prisma.challenge.deleteMany(),
    prisma.user.deleteMany()
  ])
  await prisma.$executeRawUnsafe('Alter Table User auto_increment=1')
  await prisma.$executeRawUnsafe('Alter Table Challenge auto_increment=1')
  await prisma.$executeRawUnsafe('Alter Table WeeklyPlan auto_increment=1')
}

console.log('Reset DB...')
resetDatabase()

// npm run restDB

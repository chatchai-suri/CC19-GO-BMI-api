
const bcrypt = require('bcryptjs')
const prisma = require('../config/prisma')

const hashedPassword = bcrypt.hashSync('123456', 10)

const userData = [
	{
		name: 'Poo', password: hashedPassword, email: 'poo@mail.com',
		profileImage: 'https://www.svgrepo.com/svg/420364/avatar-male-man'
	},
	{
		name: 'Porn', password: hashedPassword, email: 'porn@mail.com',
		profileImage: 'https://www.svgrepo.com/svg/420317/artist-avatar-marilyn'
	},
	{
		name: 'Kob', password: hashedPassword, mobile: '1111111111',
		profileImage: 'https://www.svgrepo.com/svg/428249/boy'
	},
	{
		name: 'Pla', password: hashedPassword, mobile: '2222222222',
		profileImage: 'https://www.svgrepo.com/svg/428250/girl'
	},
]

const challengeData = [
  { userId: 1, name: 'challengeNo.1', weightCurrent: 80.0, heightCurrent: 167.0, weightTarget: 78.5, age: 59, periodWeek: 5, surveyResult: "Survey result of challengeNo.1"},
  { userId: 1, name: 'challengeNo.2', weightCurrent: 80.0, heightCurrent: 167.0, weightTarget: 78.0, age: 59, periodWeek: 7, surveyResult: "Survey result of challengeNo.2"}
]

const weeklyPlanData = [
  {challengeId: 1, week: 1, breakfast: 'ขนมปังโฮลวีต + ไข่ดาว', lunch: 'อกไก่นึ่ง + ข้าวกล้อง + ผักลวก', dinner: 'ซุปไก่ + ผักรวม', snack: 'โยเกิร์ตกรีก + อัลมอนด์ 10 เม็ด', calories: 1600,  exerciseType: 'เดินเร็ว + คาร์ดิโอ', exerciseFrequency: 4, exerciseDuration: 30,  targetWeight: 78.5},
  {challengeId: 1, week: 2, breakfast: 'สมูทตี้ผลไม้ + ข้าวโอ๊ต', lunch: 'สเต็กปลาแซลมอน + มันหวาน + บรอกโคลี', dinner: 'ไข่ตุ๋น + ผักนึ่ง', snack: 'ถั่วลิสงอบ 10 เม็ด', calories: 1600,  exerciseType: 'โยคะ + เดินเร็ว', exerciseFrequency: 4, exerciseDuration: 35,  targetWeight: 78.0},
  {challengeId: 1, week: 3, breakfast: 'แพนเค้กข้าวโอ๊ต + นมอัลมอนด์', lunch: 'ปลาย่าง + ข้าวไรซ์เบอร์รี่', dinner: 'ต้มจืดเต้าหู้หมูสับ', snack: 'อัลมอนด์ 10 เม็ด', calories: 1550,  exerciseType: 'เวทเทรนนิ่ง + คาร์ดิโอ', exerciseFrequency: 5, exerciseDuration: 40,  targetWeight: 77.5},
  {challengeId: 1, week: 4, breakfast: 'โจ๊กข้าวโอ๊ต + ไข่ลวก', lunch: 'อกไก่อบ + คีนัว + ผักนึ่ง', dinner: 'แกงส้มกุ้ง + ผักรวม', snack: 'โยเกิร์ตไขมันต่ำ', calories: 1550,  exerciseType: 'HIIT + เวทเทรนนิ่ง', exerciseFrequency: 5, exerciseDuration: 40,  targetWeight: 77.0},
  {challengeId: 1, week: 5, breakfast: 'สมูทตี้โปรตีน + กล้วย', lunch: 'สเต็กไก่ + มันเทศ + บรอกโคลี', dinner: 'สลัดอกไก่ + ซุปผัก', snack: 'ถั่วลิสงอบ 15 เม็ด', calories: 1500,  exerciseType: 'วิ่ง + เวทเทรนนิ่ง', exerciseFrequency: 5, exerciseDuration: 45,  targetWeight: 76.5},
  {challengeId: 2, week: 1, breakfast: 'ขนมปังโฮลวีต + ไข่ดาว', lunch: 'อกไก่นึ่ง + ข้าวกล้อง + ผักลวก', dinner: 'ซุปไก่ + ผักรวม', snack: 'โยเกิร์ตกรีก + อัลมอนด์ 10 เม็ด', calories: 1600,  exerciseType: 'เดินเร็ว + คาร์ดิโอ', exerciseFrequency: 4, exerciseDuration: 30,  targetWeight: 78.5},
  {challengeId: 2, week: 2, breakfast: 'สมูทตี้ผลไม้ + ข้าวโอ๊ต', lunch: 'สเต็กปลาแซลมอน + มันหวาน + บรอกโคลี', dinner: 'ไข่ตุ๋น + ผักนึ่ง', snack: 'ถั่วลิสงอบ 10 เม็ด', calories: 1600,  exerciseType: 'โยคะ + เดินเร็ว', exerciseFrequency: 4, exerciseDuration: 35,  targetWeight: 78.0},
  {challengeId: 2, week: 3, breakfast: 'แพนเค้กข้าวโอ๊ต + นมอัลมอนด์', lunch: 'ปลาย่าง + ข้าวไรซ์เบอร์รี่', dinner: 'ต้มจืดเต้าหู้หมูสับ', snack: 'อัลมอนด์ 10 เม็ด', calories: 1450,  exerciseType: 'เวทเทรนนิ่ง + คาร์ดิโอ', exerciseFrequency: 5, exerciseDuration: 40,  targetWeight: 77.5},
  {challengeId: 2, week: 4, breakfast: 'โจ๊กข้าวโอ๊ต + ไข่ลวก', lunch: 'อกไก่อบ + คีนัว + ผักนึ่ง', dinner: 'แกงส้มกุ้ง + ผักรวม', snack: 'โยเกิร์ตไขมันต่ำ', calories: 1450,  exerciseType: 'HIIT + เวทเทรนนิ่ง', exerciseFrequency: 5, exerciseDuration: 40,  targetWeight: 77.0},
  {challengeId: 2, week: 5, breakfast: 'สมูทตี้โปรตีน + กล้วย', lunch: 'สเต็กไก่ + มันเทศ + บรอกโคลี', dinner: 'สลัดอกไก่ + ซุปผัก', snack: 'ถั่วลิสงอบ 15 เม็ด', calories: 1450,  exerciseType: 'วิ่ง + เวทเทรนนิ่ง', exerciseFrequency: 5, exerciseDuration: 45,  targetWeight: 76.5},
  {challengeId: 2, week: 6, breakfast: "ข้าวโอ๊ต + นมอัลมอนด์", lunch: "ปลาอบ + คีนัว + ผักย่าง", dinner: "ต้มยำกุ้ง + ผักรวม", snack: "ถั่วอัลมอนด์ 10 เม็ด", calories: 1500, exerciseType: "เวทเทรนนิ่ง + HIIT", exerciseFrequency: 5, exerciseDuration: 45, targetWeight: 76},
  {challengeId: 2, week: 7, breakfast: "แพนเค้กข้าวโอ๊ต + น้ำผึ้ง", lunch: "สเต็กปลาแซลมอน + บรอกโคลี", dinner: "สลัดทูน่า + ซุปผัก", snack: "โยเกิร์ตไขมันต่ำ", calories: 1450, exerciseType: "วิ่ง + คาร์ดิโอ", exerciseFrequency: 5, exerciseDuration: 50, targetWeight: 75.5}
]

console.log('DB seed...')

async function seedDB() {
  await prisma.user.createMany({data: userData})
  await prisma.challenge.createMany({data: challengeData})
  await prisma.weeklyPlan.createMany({data: weeklyPlanData})
}

seedDB()

// npx prisma db seed
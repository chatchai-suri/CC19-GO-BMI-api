const path = require('path')
const fs = require('fs/promises')
const cloudinary = require('../config/cloudinary')
const prisma = require('../config/prisma')
const createError = require('../utils/createError')
const axios = require('axios')

exports.updateProfile = async (req, res, next) => {
  try {
    // code
    const id = req.user.id
    const havefile = !!req.file
    let uploadResult = {}
    if(havefile) {
      console.log(req.file.path)
      uploadResult = await cloudinary.uploader.upload(req.file.path, {
        overwrite: true,
        public_id: path.parse(req.file.path).name
      })
      fs.unlink(req.file.path)
    }
    console.log(uploadResult)

    const data = {
      profileImage: uploadResult.secure_url || '',
    }

    const result = await prisma.user.update({
      where: {id: +id},
      data: data
    })

    res
    .status(201)
    .json({message: 'Update Profile picture ==> Done', result: result})
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.createChallenge = async (req, res, next) => {
  try {
    const {age, weightCurrent, heightCurrent} = req.body


    if( !age || !weightCurrent || !heightCurrent ) {
      createError(400, 'Please fill in all required data')
    }
    if(isNaN(age) || isNaN(weightCurrent) || isNaN(heightCurrent)) {
      createError(400, 'Invalid data type')
    }

    // will ask AI to evalulate AI and get surveyResult
    // const result = await axios.post('http://localhost:11434/api/generate',{
      
    //     "model": "deepseek-r1:7b",
    //     "prompt": `
    //     1. Evalute BMI(Body Mass Index) of age: ${age}, weight: ${weightCurrent}, height: ${heightCurrent}
    //     2. Advise how keep good BMI and healthly (e.g. reduce weight), within 3 sentenses
    //     `,
    //     "stream": false
      
    // })

    // console.log('result.response', result.response)
    
    // assume obtain AI output of surveyResult as below
    let surveyResult = 'Hello, let us go to get challenge plan'

    // assign initial data to create initial challenge during survey state
    let name = 'dummy'
    let weightTarget = 50.0
    let periodWeek = 5

    const initChaData = {
      userId: req.user.id,
      name: name,
      weightCurrent: weightCurrent,
      heightCurrent: heightCurrent,
      weightTarget: weightTarget,
      age: age,
      periodWeek: periodWeek,
      surveyResult: surveyResult,
    }
    // console.log(initChaData)
    // create and update challenge through same method .upsert
    const chaInt = await prisma.challenge.upsert({
      where: {
        id: req.user.id
      },
      create: initChaData,
      update: initChaData
    })
    
    res.status(201).json({message: 'create survey success', chaInt: chaInt})


  
    
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.createWeeklyPlan = async (req, res, next) => {
  try {
  const {challengeId, userId, name, weightCurrent, heightCurrent, weightTarget, age, periodWeek, surveyResult} = req.body
  // use above data request to AI to obtain weekly plan
  // const result = await axios.post('http://localhost:11434/api/generate',{
  //     "model": "deepseek-r1:7b",
  //     "prompt": `
  //     1. create weekly plan to reduce current weight ${weightCurrent} to target weight ${weightTarget} within duration ${periodWeek} weeks
  //     2. weeklyPlan 1 week as 1 record, contain field {challengeId, week, breakfast, lunch, dinner, snack, calories, exerciseType, exerciseFrequency, exerciseDuration, targetWeight}
  //     3. weeklyPlan is JSON format
  //     4. sample of weeklyPlan  {week: 3, breakfast: "แพนเค้กข้าวโอ๊ต + นมอัลมอนด์", lunch: "ปลาย่าง + ข้าวไรซ์เบอร์รี่", dinner: "ต้มจืดเต้าหู้หมูสับ", snack: "อัลมอนด์ 10 เม็ด", calories: 1550, exerciseType: "เวทเทรนนิ่ง + คาร์ดิโอ", exerciseFrequency: 5, exerciseDuration: "40 นาที", targetWeight: 77.5}
  //     `,
  //     "stream": false
  // })

  // console.log('result.response', result.response)
  
  // assume obtain AI output of surveyResult as below + field challengeId send from front end
    const initWeeklyPlan = [
      {challengeId: 3, week: 1, breakfast: 'ขนมปังโฮลวีต + ไข่ดาว', lunch: 'อกไก่นึ่ง + ข้าวกล้อง + ผักลวก', dinner: 'ซุปไก่ + ผักรวม', snack: 'โยเกิร์ตกรีก + อัลมอนด์ 10 เม็ด', calories: 1600,  exerciseType: 'เดินเร็ว + คาร์ดิโอ', exerciseFrequency: 4, exerciseDuration: 30,  targetWeight: 78.5},
      {challengeId: 3, week: 2, breakfast: 'สมูทตี้ผลไม้ + ข้าวโอ๊ต', lunch: 'สเต็กปลาแซลมอน + มันหวาน + บรอกโคลี', dinner: 'ไข่ตุ๋น + ผักนึ่ง', snack: 'ถั่วลิสงอบ 10 เม็ด', calories: 1600,  exerciseType: 'โยคะ + เดินเร็ว', exerciseFrequency: 4, exerciseDuration: 35,  targetWeight: 78.0},
      {challengeId: 3, week: 3, breakfast: 'แพนเค้กข้าวโอ๊ต + นมอัลมอนด์', lunch: 'ปลาย่าง + ข้าวไรซ์เบอร์รี่', dinner: 'ต้มจืดเต้าหู้หมูสับ', snack: 'อัลมอนด์ 10 เม็ด', calories: 1450,  exerciseType: 'เวทเทรนนิ่ง + คาร์ดิโอ', exerciseFrequency: 5, exerciseDuration: 40,  targetWeight: 77.5}
    ]

    const result = await prisma.weeklyPlan.createMany({data: initWeeklyPlan})

    res.status(201).json({result: result})
  
  }catch (error) {
    console.log(error)
    next(error)
  }
}
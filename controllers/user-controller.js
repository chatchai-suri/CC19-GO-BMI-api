const path = require("path");
const fs = require("fs/promises");
const cloudinary = require("../config/cloudinary");
const prisma = require("../config/prisma");
const createError = require("../utils/createError");
const axios = require("axios");
const { number } = require("zod");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.updateProfile = async (req, res, next) => {
  try {
    // code
    const id = req.user.id;
    const havefile = !!req.file;
    let uploadResult = {};
    if (havefile) {
      console.log(req.file.path);
      uploadResult = await cloudinary.uploader.upload(req.file.path, {
        overwrite: true,
        public_id: path.parse(req.file.path).name,
      });
      fs.unlink(req.file.path);
    }
    console.log(uploadResult);

    const data = {
      profileImage: uploadResult.secure_url || "",
    };

    const result = await prisma.user.update({
      where: { id: +id },
      data: data,
    });

    const { password, createdAt, updatedAt, ...userData } = result;

    res
      .status(200)
      .json({ message: "Update Profile picture ==> Done", userData: userData });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.listUserAll = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      omit: {
        password: true,
      }
    })
    console.log("users ==== ", users)
    res.json({message: "Hello, listUserAll", data: users})
  } catch (error) {
    console.error("Somthing wrong", error)
    next(error)
  }
}

exports.updateUserRole = async (req, res, next) => {
  try {
    const {id, role} = req.body
    const updated = await prisma.user.update({
      where: {
        id: Number(id)
      },
      data: {
        role: role
      }
    })
    console.log("updated ==== ", updated)
    res.json({message: "Update success", data: updated})
  } catch (error) {
    console.error("Somthing wrong!", error)
    next(error)
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const {id} = req.params
    const deleted = await prisma.user.delete({
      where: {
        id: Number(id)
      }
    })
    console.log("deleted user id ==== ", deleted)
    res.json({message: "Delete success"})
  } catch (error) {
    console.error("Somthing wrong", error)
    next(error)
  }
}



exports.createChallenge = async (req, res, next) => {
  try {
    const { age, weightCurrent, heightCurrent } = req.body;

    if (!age || !weightCurrent || !heightCurrent) {
      createError(400, "Please fill in all required data");
    }
    if (isNaN(age) || isNaN(weightCurrent) || isNaN(heightCurrent)) {
      createError(400, "Invalid data type");
    }

    // will ask AI to evalulate AI and get surveyResult

    //1) via ollama, model: deepseek-r1:7b
    // const result = await axios.post('http://localhost:11434/api/generate',{
    //     "model": "deepseek-r1:7b",
    //     "prompt": `
    //     1. Evalute BMI(Body Mass Index) of age: ${age}, weight: ${weightCurrent}, height: ${heightCurrent}
    //     2. Advise how keep good BMI and healthly (e.g. reduce weight), within 3 sentenses
    //     `,
    //     "stream": false
    // })

    // 2) Gemini, model: "gemini-2.0-flash"
    const key = process.env.GEMINI_PROMPT_KEY;
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    req.body.text = `no nees JS code, 1. just calculate BMI(Body Mass Index) of height ${heightCurrent} cm, weight ${weightCurrent} kg, 2. from BMI and age  ${age}, do ADVISE of 1 paragraph (about 3 sentenses) how to keep healthy in Thai language, 3. return the result object that there are only 2 properties of BMI and ADVISE which key and value are JavaScript Object format, 4. no need other explanation and \`\`\` and javascript and any header just return the result object!, for example response: '{"BMI": "28.72", "ADVISE": "ค่า BMI ของคุณอยู่ในเกณฑ์น้ำหนักเกิน ควรควบคุมอาหารโดยเน้นผักผลไม้และลดอาหารที่มีไขมันสูง ควบคู่กับการออกกำลังกายอย่างสม่ำเสมอ เช่น เดินเร็ว หรือว่ายน้ำ อย่างน้อย 30 นาทีต่อวัน เพื่อรักษาสุขภาพให้แข็งแรงและลดความเสี่ยงของโรคต่างๆ"}'`;
    const prompt = req.body.text;

    const result = await model.generateContent(prompt);

    console.log("result=================", result);
    console.log("*********", result.response.text());
    const response = result.response.text();
    console.log(">>>>>>>", response, typeof response);
    const aaa = response.split("```json")[1];
    const bbb = JSON.parse(aaa.split("```")[0]);
    console.log(">>>>>>>---------------", bbb);
    const { BMI, ADVISE } = bbb;
    console.log("&&&&&&&&&&&", ADVISE);

    // res.status(200).json({ message: "Hello Chat" , result: response});

    // console.log('result.response', result.response)

    // assume obtain AI output of surveyResult as below
    let surveyResult = ADVISE;
    let bmi = BMI;

    // assign initial data to create initial challenge during survey state
    // let name = "dummy";
    // let weightTarget = 50.0;
    // let periodWeek = 5;

    const initChaData = {
      userId: req.user.id,
      weightCurrent: Number(weightCurrent),
      heightCurrent: Number(heightCurrent),
      age: Number(age),
      bmi: Number(bmi),
      surveyResult: surveyResult,
    };
    // console.log(initChaData)
    // create and update challenge through same method .upsert
    // const chaData = await prisma.challenge.upsert({
    //   where: {
    //     id: id,
    //   },
    //   create: initChaData,
    //   update: initChaData,
    // });

    // create challenge from bmi and surveyResult received from AI
    const chaData = await prisma.challenge.create({
      data: initChaData,
    });

    res
      .status(201)
      // .json({ message: "Received survey result from AI success" });
      .json({ message: "create survey success", challengeData: chaData });
    // .json({ message: "create survey success", });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.createWeeklyPlan = async (req, res, next) => {
  console.log("createWeeklyPlan: req.user =", req.user);
  console.log("createWeeklyPlan: req.body =", req.body);
  const { id } = req.body;
  try {
    const {
      id,
      userId,
      name,
      weightCurrent,
      heightCurrent,
      weightTarget,
      age,
      periodWeek,
      surveyResult,
    } = req.body;

    // step 1 update name of program name  into challenge table
    const updateChallenge = await prisma.challenge.update({
      where: {
        userId: req.user.id,
        id: req.body.id,
      },
      data: {
        name: req.body.name,
        weightTarget: Number(req.body.weightTarget),
        periodWeek: Number(req.body.periodWeek),
      },
    });

    // step 2 use above data request to AI to obtain weekly plan

    // 2.1 via ollama "model": "deepseek-r1:7b"
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

    // 2.2 Gemini, model: "gemini-2.0-flash"
    const key = process.env.GEMINI_PROMPT_KEY;
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `from weightCurrent ${weightCurrent} kg reduce to TargetWeight ${weightTarget} kg, within ${periodWeek} weeks, challengeId is ${id} 1. advise diet and exercise plan by weekly, 1 week is 1 record, each record contain fields: challengeId, week, breakfast, lunch, dinner, snack, calories, exerciseType, exerciseFrequency, exerciseDuration, targetWeight, 2. Value of each field in Thai menus and Thai language only, 3. value of field breakfast, lunch, dinner, snack, calories, exerciseType only Thai alphabet  no need bracket which contain English alphabet for example ข้าวโอ๊ตกับผลไม้รวมและถั่ว (Khao oat gap phonlamai ruam lae thua) must be ข้าวโอ๊ตกับผลไม้รวมและถั่ว, 4. Value of field challengeId, week, calories, exerciseFrequency, exerciseDuration is only number, 5. Return only each week record and its fields in JSON format`;

    const result = await model.generateContent(prompt);
    // 2.2.1 eliminate some 
    console.log("result=================", result);
    console.log("*********", result.response.text());
    const response = result.response.text();
    console.log(">>>>>>>", response, typeof response);
    const aaa = response.split("```json")[1];
    const bbb = JSON.parse(aaa.split("```")[0]);
    console.log(">>>>>>>---------------", bbb);

    const weeklyPlanData = await prisma.weeklyPlan.createMany({
      data: bbb,
    });
    console.log(weeklyPlanData);

    const getWeeklyPlanData = await prisma.weeklyPlan.findMany({
      where: { challengeId: id },
    });
    console.log(getWeeklyPlanData);

    res
      .status(201)
      .json({
        message: "Received survey result from AI success",
        weeklyPlanData: getWeeklyPlanData,
        updateChallenge
      });

  } catch (error) {
    next(error);
  }
};

exports.getChallengebyId = async (req, res, next) => {
  const { id } = req.params;
  
  try {
    const result = await prisma.challenge.findUnique({
      where: {
        id: Number(id),
      },
    });
    res
      .status(200)
      .json({
        message: "Get challenge data by id success",
        challengeData: result,
      });
      console.log("challengeData = ", result)
  } catch (error) {
    next(error);
  }
};

exports.getChallengeAll = async (req, res, next) => {
  const { id } = req.user;
  try {
    const result = await prisma.challenge.findMany({
      where: {
        userId: id,
      },
      orderBy: {createdAt: "desc"}
    });
    res
      .status(200)
      .json({
        message: "Get list all challenge of single user success",
        challengeList: result,
      });
      console.log("challengeList = ", result )
  } catch (error) {
    next(error);
  }
};

exports.deleteChallengeById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await prisma.challenge.delete({
      where: {
        id: Number(id),
      },
    });
    res
      .status(200)
      .json({
        message: "Delete challenge data by id success",
        chlDeletedData: result,
      });
  } catch (error) {
    next(error);
  }
};

exports.updateChallengeById = async (req, res, next) => {
  const {id} = req.params
  console.log("id ====", id)
  const {name} = req.body;
  console.log("name ==== ", name)
  try {
    const result = await prisma.challenge.update({
      where: {
        id: Number(id),
      },
      data: { name: name },
    });
    console.log("result ==== ", result)
    res
      .status(200)
      .json({
        message: "Update challenge data by id success",
        challengeData: result,
      });
  } catch (error) {
    next(error);
  }
};

exports.updateWeeklyPlanById = async (req, res, next) => {
  try {
    const { id, weightResult} = req.body
    if ( !id || !weightResult) {
      createError(400, "Not Enough required data field");
    }

    const updatedWeeklyPlan = await prisma.weeklyPlan.update({
      where: {
        id: Number(id)
      },
      data: { 
        weightResult:  Number(weightResult)}
    })
    res.status(200).json({ message: "Actual Weight updating success", weeklyPlanData: updatedWeeklyPlan })
    
  } catch (error) {
    console.log(error)
  }
}

exports.getWeeklyPlanById = async (req, res, next) => {
  const {id} = req.params
  console.log("id========", id)
  try {
    const result = await prisma.weeklyPlan.findMany({
      where: {
        challengeId: Number(id),
      },
      include: {
        challenge: {
          select: {
            id: true,
            name: true,
          }
        }
      }

    });
    res
      .status(200)
      .json({
        message: "Get weekly plan data by id success",
        weeklyPlanDataById: result,
      });
      console.log("weeklyPlanDataById = ", result)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

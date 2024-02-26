const Student = require("../models/studentProfile");
const FeeSchema = require("../models/feesModel.js");
const FeeMaster = require("../models/feeMasterModel.js");
const { default: mongoose } = require("mongoose");

const addNewFee = async (req, res) => {
  try {
    const { amount, semester, dueDate, feesFor, rollNumber } = req.body;
    const currentYear = new Date().getFullYear();

    let feeMaster = await FeeMaster.findOne({
      year: currentYear,
      semester: semester,
    });

    if (!feeMaster) {
      feeMaster = await FeeMaster.create({
        year: currentYear,
        semester: semester,
      });
    }

    // console.log(feeMaster._id);

    // ! This add fee entry into student profile according to feeFor new student, all students and one personal student
    if (feesFor === "new") {
      const studentsWithEmptyFees = await Student.find({ fees: [] });

      for (const student of studentsWithEmptyFees) {
        const feeSchema = await createFeeSchema(
          feeMaster._id,
          student._id,
          amount,
          currentYear,
          semester,
          dueDate
        );
        student.fees.push(feeSchema);
        await student.save();
      }
    } else if (feesFor === "all") {
      const students = await Student.find();
      // Loop through all students and add fee schema
      for (const student of students) {
        const feeSchema = await createFeeSchema(
          feeMaster._id,
          student._id,
          amount,
          currentYear,
          semester,
          dueDate
        );

        student.fees.push(feeSchema);
        await student.save();
      }
    } else if (feesFor === "personal") {
      const student = await Student.findOne({ rollNumber: rollNumber });

      const feeSchema = await createFeeSchema(
        feeMaster._id,
        student._id,
        amount,
        currentYear,
        semester,
        dueDate
      );

      student.fees.push(feeSchema);
      await student.save();
    }

    console.log("Fee schemas added to all students successfully.");
    res.status(200).json({ message: "Success", feeMaster });
  } catch (error) {
    res.status(400).json({ message: "fail" });
    console.log(error);
  }
};

async function createFeeSchema(
  feeMasterId,
  studentId,
  amount,
  cuurentYear,
  semester,
  dueDate
) {
  const schema = await FeeSchema.create({
    feeMasterId: feeMasterId,
    studentId: studentId,
    amount: amount,
    year: cuurentYear,
    semester: semester,
    dueDate: dueDate,
  });

  return schema;
}

const deleteFee = async (req, res) => {
  try {
    const { studentId, feeId } = req.body;

    const feeObject = await FeeSchema.findById(feeId);

    if (!feeObject) {
      return res.status(404).json({ message: "Fee not found" });
    }

    const deletedFeeStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        $pull: { fees: feeId },
      },
      { new: true }
    );

    if (!deletedFeeStudent) {
      // Handle the case where the student with the provided ID is not found
      console.log("Student not found");
      return null;
    }

    const result = await FeeSchema.deleteOne({ _id: feeId });

    const updatedStudent = await Student.findById(studentId).populate("fees");

    if (result.deletedCount === 1) {
      res
        .status(200)
        .json({ message: "Fee deleted successfully", updatedStudent });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error deleteing Fee" });
  }
};

const collectFee = async (req, res) => {
  try {
    const { studentId, feeId, amount, date } = req.body;

    const feeObject = await FeeSchema.findById(feeId);

    if (!feeObject) {
      return res.status(404).json({ message: "Fee not found" });
    }

    const sum = Number(feeObject.totalAmountPaid) + Number(amount);

    if (sum == feeObject.amount) {
      feeObject.totalAmountPaid = sum;
      feeObject.paymentStatus = "Paid";
    } else if (sum < feeObject.amount) {
      feeObject.totalAmountPaid = sum;
      feeObject.paymentStatus = "Partial";
    } else {
      res.status(403).json({
        message: "Paid amount have became more than required amount",
      });
      return;
    }

    const finalAmount = Number(amount);

    feeObject.paidAmount.push({
      amount: finalAmount,
      date: date,
    });

    await feeObject.save();

    const updatedStudent = await Student.findById(studentId).populate("fees");

    // console.log(feeObject);
    res
      .status(200)
      .json({ message: "Paid Successfully", feeObject, updatedStudent });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed" });
  }
};

const addPanelty = async (req, res) => {
  try {
    const { feeId, penaltyAmount, studentId } = req.body;

    const feeObject = await FeeSchema.findById(feeId);

    if (!feeObject) {
      return res.status(404).json({ message: "Fee not found" });
    } else {
      feeObject.penalty = Number(feeObject.penalty) + Number(penaltyAmount);
      feeObject.amount = Number(feeObject.amount) + Number(penaltyAmount);
      feeObject.save();
      const updatedStudent = await Student.findById(studentId).populate("fees");
      res
        .status(200)
        .json({ message: "Panelty Added Succesfully", updatedStudent });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed" });
  }
};

const clearPanelty = async (req, res) => {
  try {
    const { feeId, studentId } = req.body;

    const feeObject = await FeeSchema.findById(feeId);

    if (!feeObject) {
      return res.status(404).json({ message: "Fee not found" });
    } else {
      feeObject.amount = Number(feeObject.amount) - Number(feeObject.penalty);
      feeObject.penalty = 0;
      feeObject.save();
      const updatedStudent = await Student.findById(studentId).populate("fees");
      res
        .status(200)
        .json({ message: "Panelty Added Succesfully", updatedStudent });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed" });
  }
};

const getStudentByRollNumber = async (req, res) => {
  try {
    const query = req.query.q;
    // console.log(query);

    const student = await Student.findOne({ rollNumber: query }).populate(
      "fees"
    );

    if (!student) {
      res.status(404).json({ message: "Student not found" });
    } else {
      // console.log(student);
      res.status(200).json({ message: "Success", student });
    }
  } catch (error) {
    console.log("Error in getting details", error);
    res.status(400).json({ message: "Failed" });
  }
};

const revertFee = async (req, res) => {
  try {
    const { subFeeId, feeId, amount } = req.body;

    const fee = await FeeSchema.findById(feeId);

    if (!fee) {
      console.log("Fee not found");
      return;
    }

    const paidSchemaIndex = fee.paidAmount.findIndex(
      (paid) => paid._id.toString() === subFeeId
    );

    // console.log(paidSchemaIndex);

    if (paidSchemaIndex === -1) {
      console.log("PaidFeeSchema not found");
    } else {
      fee.totalAmountPaid = fee.totalAmountPaid - amount;
      if (fee.totalAmountPaid === 0) {
        fee.paymentStatus = "Pending";
      } else if (fee.totalAmountPaid < fee.amount) {
        fee.paymentStatus = "Partial";
      }

      fee.paidAmount.splice(paidSchemaIndex, 1);

      await fee.save();

      const updatedStudent = await Student.findById(fee.studentId).populate(
        "fees"
      );

      res.status(200).json({
        message: "PaidSchema deleted successfully",
        updatedStudent,
        fee,
      });
    }
  } catch (error) {
    console.log("Erro while reverting", error);
    res.status(400).json({ message: "Failed to revert" });
  }
};

const getDueFeeStudent = async (req, res) => {
  try {
    const { year, semester } = req.body;

    const currentDate = new Date();

    if (year === "" && semester == "") {
      return;
    } else {
      if (year === "") {
        // Find FeeMaster documents
        const feemasters = await FeeMaster.find({ semester: semester });

        if (feemasters) {
          // Array to store results
          const feesArray = [];

          // Iterate through each feemaster
          for (const feemaster of feemasters) {
            // Find fees for the current feemaster
            const fees = await FeeSchema.find({
              feeMasterId: feemaster._id,
              dueDate: { $lt: currentDate },
            }).populate("student");

            // Add the fees to the results array
            feesArray.push(...fees);
          }
          res.status(200).json({ message: "Students Details:", feesArray });
        }
      } else if (semester === "") {
        // Find FeeMaster documents
        const feemasters = await FeeMaster.find({ year: year });

        if (feemasters) {
          // Array to store results
          const feesArray = [];

          // Iterate through each feemaster
          for (const feemaster of feemasters) {
            // Find fees for the current feemaster
            const fees = await FeeSchema.find({
              feeMasterId: feemaster._id,
              dueDate: { $lt: currentDate },
            }).populate("student");

            // Add the fees to the results array
            feesArray.push(...fees);
          }
          res.status(200).json({ message: "Students Details:", feesArray });
        }
      } else {
        const feemaster = await FeeMaster.findOne({
          year: year,
          semester: semester,
        });

        const feesArray = await FeeSchema.find({
          feeMasterId: feemaster._id,
          dueDate: { $lt: currentDate },
        }).populate("student");

        res.status(200).json({ message: "Students Details:", feesArray });
      }
    }
  } catch (error) {
    console.log("Error in getting student details", error);
    res.status(400).json({ message: "Failed to get a student details" });
  }
};

module.exports = {
  addNewFee,
  collectFee,
  getStudentByRollNumber,
  revertFee,
  addPanelty,
  clearPanelty,
  deleteFee,
  getDueFeeStudent,
};

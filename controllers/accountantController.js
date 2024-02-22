const User = require("../models/userModel");
const Student = require("../models/studentProfile");
const feeSchema = require("../models/feesModel.js");

const addNewFee = async (req, res) => {
  try {
    const { amount, semester, dueDate, feesFor } = req.body;
    const currentYear = new Date().getFullYear();

    const students = await Student.find();

    const studentsWithEmptyFees = await Student.find({ fees: [] });

    if (feesFor === "new") {
      for (const student of studentsWithEmptyFees) {
        const feeSchema = await createFeeSchema(
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
      // Loop through all students and add fee schema
      for (const student of students) {
        const feeSchema = await createFeeSchema(
          student._id,
          amount,
          currentYear,
          semester,
          dueDate
        );

        student.fees.push(feeSchema);
        await student.save();
      }
    }

    console.log("Fee schemas added to all students successfully.");
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(400).json({ message: "fail" });
    console.log(error);
  }
};

async function createFeeSchema(
  studentId,
  amount,
  cuurentYear,
  semester,
  dueDate
) {
  const schema = await feeSchema.create({
    studentId: studentId,
    amount: amount,
    year: cuurentYear,
    semester: semester,
    dueDate: dueDate,
  });

  return schema;
}

const collectFee = async (req, res) => {
  try {
    const { studentId, feeId, amount, date } = req.body;

    const feeObject = await feeSchema.findById(feeId);

    if (!feeObject) {
      return res.status(404).json({ message: "Fee not found" });
    }

    // console.log(feeObject);

    const sum = Number(feeObject.totalAmountPaid) + Number(amount);
    // console.log(sum);
    // console.log(feeObject.amount);

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

    console.log(feeObject);
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

    const feeObject = await feeSchema.findById(feeId);

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

    const feeObject = await feeSchema.findById(feeId);

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

    const fee = await feeSchema.findById(feeId);

    if (!fee) {
      console.log("Fee not found");
      return;
    }

    const paidSchemaIndex = fee.paidAmount.findIndex(
      (paid) => paid._id.toString() === subFeeId
    );

    console.log(paidSchemaIndex);

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

module.exports = {
  addNewFee,
  collectFee,
  getStudentByRollNumber,
  revertFee,
  addPanelty,
  clearPanelty,
};

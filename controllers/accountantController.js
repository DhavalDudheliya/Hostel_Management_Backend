const Student = require("../models/studentProfile");
const FeeSchema = require("../models/feesModel.js");
const FeeMaster = require("../models/feeMasterModel");
const puppeteer = require("puppeteer");

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

        if (!feeSchema) {
          return res.status(400).json({ message: "Cannot make fee Schema" });
        }

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

        if (!feeSchema) {
          return res.status(400).json({ message: "Cannot make fee Schema" });
        }

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

      if (!feeSchema) {
        return res.status(400).json({ message: "Cannot make fee Schema" });
      }

      student.fees.push(feeSchema);
      await student.save();
    }

    if (!feeMaster) {
      return res.status(400).json({ message: "Cannot make fee master" });
    }

    console.log("Fee schemas added to all students successfully.");
    res.status(200).json({ message: "Success", feeMaster });
  } catch (error) {
    res.status(500).json({ message: "fail" });
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
    student: studentId,
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
    res.status(500).json({ message: "Error deleteing Fee" });
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
    const feeMaster = await FeeMaster.findById(feeObject.feeMasterId);

    console.log(feeMaster);

    if (sum == feeObject.amount) {
      feeObject.totalAmountPaid = sum;
      feeObject.paymentStatus = "Paid";
      feeMaster.totalCollection = feeMaster.totalCollection + Number(amount);
    } else if (sum < feeObject.amount) {
      feeObject.totalAmountPaid = sum;
      feeObject.paymentStatus = "Partial";
      feeMaster.totalCollection = feeMaster.totalCollection + Number(amount);
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
      method: "Cash",
    });

    await feeObject.save();
    await feeMaster.save();

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

    console.log(amount);

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
      const feeMaster = await FeeMaster.findById(fee.feeMasterId);
      fee.totalAmountPaid = fee.totalAmountPaid - amount;
      feeMaster.totalCollection = feeMaster.totalCollection - Number(amount);
      if (fee.totalAmountPaid === 0) {
        fee.paymentStatus = "Pending";
      } else if (fee.totalAmountPaid < fee.amount) {
        fee.paymentStatus = "Partial";
      }

      fee.paidAmount.splice(paidSchemaIndex, 1);

      await fee.save();
      await feeMaster.save();

      const updatedStudent = await Student.findById(fee.student).populate(
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
      } else if ((semester === "" || semester === "Both") && year !== "") {
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

const generateReceipt = async (req, res) => {
  try {
    const { feeId, subFeeId } = req.body;

    const fee = await FeeSchema.findById(feeId);
    const student = await Student.findById(fee.student._id);
    const paidSchemaIndex = fee.paidAmount.findIndex(
      (paid) => paid._id.toString() === subFeeId
    );

    console.log(fee.paidAmount[paidSchemaIndex]);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Essential for running in a headless environment like Render
      executablePath: process.env.CHROME_BIN || null, // Use CHROME_BIN environment variable if set
    });

    const page = await browser.newPage();

    // Set the content of the receipt
    let receiptContent;
    if (fee.paidAmount[paidSchemaIndex].method === "Online") {
      receiptContent = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>PDF Generator</title>
          <style>
            body {
              font-family: "Arial", sans-serif;
              margin: 20px;
              position: relative;
            }
      
            body::before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: url("/server/images/logo.png") center/cover no-repeat;
              opacity: 0.5;
              filter: grayscale(100%);
              z-index: -1;
            }
      
            .header {
              text-align: center;
              color: #0066cc;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
      
            .address {
              text-align: center;
              margin-bottom: 5px;
            }
      
            .phone {
              text-align: center;
              margin-bottom: 20px;
            }
      
            hr {
              border: 1px solid #ccc;
              margin: 10px 0;
            }
      
            .name-date {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-weight: 700px;
            }
      
            .name-date p {
              margin: 5px 0;
            }
      
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
      
            th,
            td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
      
            th {
              background-color: #f2f2f2 !important;
            }
      
            .signature {
              text-align: right;
              margin-top: 75px;
              margin-right: 60px;
            }
      
            .footer {
              position: absolute;
              bottom: 20px;
              left: 20px;
              right: 20px;
              text-align: center;
            }
      
            .details {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div>
            <div class="header">BAPS SWAMINARAYAN CHHATRALAYA</div>
            <div class="address">Nutan Park Society, Nadiad, Gujarat 387001</div>
            <div class="phone">Contact: 9998990445</div>
            <hr />
            <div class="name-date">
              <div class="name-ph">
                <p>Name: ${student.firstName} ${student.lastName}</p>
                <p>Phone No: ${student.mobileNumber}</p>
              </div>
              <div class="details">
                <p>Date: ${new Date().toLocaleDateString()}</p>
                <p>Method: ${fee.paidAmount[paidSchemaIndex].method}</p>
                <p>
                  Payment Id: ${
                    fee.paidAmount[paidSchemaIndex].razorpay_payment_id
                  }
                </p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Fee Type</th>
                  <th>Fee Amount</th>
                  <th>Penalty</th>
                  <th>Fee Paid</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background-color: #f5f5f5">
                  <td>${fee.year}</td>
                  <td>${fee.semester} Fee</td>
                  <td>₹${fee.amount}</td>
                  <td>₹${fee.penalty}</td>
                  <td>₹${fee.paidAmount[paidSchemaIndex].amount}</td>
                  <td>${new Date().toLocaleDateString()}</td>
                </tr>
                <!-- Add more rows as needed -->
              </tbody>
            </table>
            <div class="signature">
              <p>Signature</p>
            </div>
          </div>
        </body>
      </html>
      `;
    } else {
      receiptContent = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>PDF Generator</title>
          <style>
            body {
              font-family: "Arial", sans-serif;
              margin: 20px;
              position: relative;
            }
      
            body::before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: url("/server/images/logo.png") center/cover no-repeat;
              opacity: 0.5;
              filter: grayscale(100%);
              z-index: -1;
            }
      
            .header {
              text-align: center;
              color: #0066cc;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
      
            .address {
              text-align: center;
              margin-bottom: 5px;
            }
      
            .phone {
              text-align: center;
              margin-bottom: 20px;
            }
      
            hr {
              border: 1px solid #ccc;
              margin: 10px 0;
            }
      
            .name-date {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-weight: 700px;
            }
      
            .name-date p {
              margin: 5px 0;
            }
      
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
      
            th,
            td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
      
            th {
              background-color: #f2f2f2 !important;
            }
      
            .signature {
              text-align: right;
              margin-top: 75px;
              margin-right: 60px;
            }
      
            .footer {
              position: absolute;
              bottom: 20px;
              left: 20px;
              right: 20px;
              text-align: center;
            }
      
            .details {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div>
            <div class="header">BAPS SWAMINARAYAN CHHATRALAYA</div>
            <div class="address">Nutan Park Society, Nadiad, Gujarat 387001</div>
            <div class="phone">Contact: 9998990445</div>
            <hr />
            <div class="name-date">
              <div class="name-ph">
                <p>Name: ${student.firstName} ${student.lastName}</p>
                <p>Phone No: ${student.mobileNumber}</p>
              </div>
              <div class="details">
                <p>Date: ${new Date().toLocaleDateString()}</p>
                <p>Method: ${fee.paidAmount[paidSchemaIndex].method}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Fee Type</th>
                  <th>Fee Amount</th>
                  <th>Penalty</th>
                  <th>Fee Paid</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background-color: #f5f5f5">
                  <td>${fee.year}</td>
                  <td>${fee.semester} Fee</td>
                  <td>₹${fee.amount}</td>
                  <td>₹${fee.penalty}</td>
                  <td>₹${fee.paidAmount[paidSchemaIndex].amount}</td>
                  <td>${new Date().toLocaleDateString()}</td>
                </tr>
                <!-- Add more rows as needed -->
              </tbody>
            </table>
            <div class="signature">
              <p>Signature</p>
            </div>
          </div>
        </body>
      </html>`;
    }

    await page.setContent(receiptContent, { waitUntil: "networkidle0" });

    // Generate PDF from the page
    const pdfBuffer = await page.pdf({
      width: "120mm",
      height: "220mm",
      landscape: true,
    });

    await browser.close();

    // Set the appropriate response headers for a PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=fee_receipt.pdf"
    );

    // Send the PDF as the response
    res.send(pdfBuffer);
  } catch (error) {
    console.log("Error in Generating Receipt", error);
    res.status(400).json({ message: "Error in generating receipt", error });
  }
};

const getLastTenDaysCollection = async (req, res) => {
  try {
    // Calculate today's date
    const today = new Date();

    // Generate an array of dates for the last 10 days including today, in "10 March" format
    const dates = Array.from({ length: 11 }, (_, i) => {
      const date = new Date(today.getTime() - (10 - i) * 24 * 60 * 60 * 1000);
      return (
        date.toISOString().slice(8, 10) +
        " " +
        date.toLocaleString("default", { month: "long" })
      );
    });

    // MongoDB aggregation pipeline to find payments made in the last 10 days
    const lastTenDaysCollection = await FeeSchema.aggregate([
      // Unwind the paidAmount array to denormalize it
      { $unwind: { path: "$paidAmount", preserveNullAndEmptyArrays: true } },
      // Group by date and sum the amount
      {
        $group: {
          _id: { $dateToString: { format: "%d %B", date: "$paidAmount.date" } },
          totalAmount: { $sum: "$paidAmount.amount" },
        },
      },
      // Project the required fields
      {
        $project: {
          _id: 0,
          date: "$_id",
          amount: { $ifNull: ["$totalAmount", 0] },
        },
      },
      // Sort by date in ascending order
      { $sort: { date: 1 } },
    ]);

    // Merge the array of dates with the payment data
    const result = dates.map((date) => {
      const payment = lastTenDaysCollection.find((item) => item.date === date);
      return { date, amount: payment ? payment.amount : 0 };
    });

    // Send the result as response
    res.status(200).json({ lastTenDaysCollection: result });
  } catch (error) {
    console.log("Error in getting collection details", error);
    res.status(400).json({ message: "Error in generating receipt", error });
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
  generateReceipt,
  getLastTenDaysCollection,
};

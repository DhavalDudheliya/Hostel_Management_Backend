const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Student = require("../models/studentProfile");
const FeeSchema = require("../models/feesModel.js");
const FormerStudent = require("../models/formerStudent");
const RollNo = require("../models/rollNoModel");
const Leaves = require("../models/leaveModel");
const Report = require("../models/reportModel");
const Blocks = require("../models/blocksModel");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const moment = require("moment");
const nodemailer = require("nodemailer");

const storage = multer.memoryStorage(); // Store files in memory (you can adjust this based on your requirements)
const upload = multer({ storage: storage });

/* SALT */
const salt = bcrypt.genSaltSync(10);

const getAllStudents = async (req, res) => {
  try {
    const { rollNo } = req.body;
    let query = { role: "Student" };

    if (rollNo) {
      query.rollNo = { $regex: `^${rollNo}`, $options: "i" };
    }

    const students = await User.find(query);
    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      rollNumber,
      firstName,
      lastName,
      bloodGroup,
      street,
      village,
      taluka,
      district,
      postalCode,
      dateOfBirth,
      cast,
      permenantDisease,
      mobileNumber,
      whatsappNumber,
      email,
      university,
      course,
      branch,
      lastSchoolName,
      lastExam,
      lastExamPercentage,
      fatherFirstName,
      fatherMiddlename,
      fatherPhoneNo,
      fatherWhatsappNo,
      fatherEmail,
      work,
    } = req.body;

    let profilePhoto;

    if (req.file) {
      profilePhoto = req.file.filename;
    }

    const userExists = await Student.findOne({ email });

    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const password = () => {
      const min = 100000; // Minimum 6-digit number
      const max = 999999; // Maximum 6-digit number
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    // const password = "123456";

    const plainPassword = password().toString(); // Convert the number to a string
    const hashedPassword = bcrypt.hashSync(plainPassword, salt);

    const studentDoc = await Student.create({
      rollNumber,
      firstName,
      lastName,
      bloodGroup,
      address: {
        street,
        village,
        taluka,
        district,
        postalCode,
      },
      dateOfBirth,
      cast,
      permenantDisease,
      mobileNumber,
      whatsappNumber,
      email,
      university,
      course,
      branch,
      lastSchoolName,
      lastExam,
      lastExamPercentage,
      fatherFirstName,
      fatherMiddlename,
      fatherPhoneNo,
      fatherWhatsappNo,
      fatherEmail,
      work,
      profilePhoto,
    });

    const userDoc = await User.create({
      role: "Student",
      firstName,
      lastName,
      email,
      personalPhoneNo: mobileNumber,
      personalWhatsappNo: whatsappNumber,
      password: hashedPassword,
      profilePhoto,
    });

    if (studentDoc) {
      // Create a nodemailer transporter
      const transporter = nodemailer.createTransport({
        // Configure your email provider details here
        service: "Gmail",
        auth: {
          user: process.env.MAIL_SENDER,
          pass: process.env.MAIL_PASS,
        },
      });

      // Send the reset email to the user
      const mailOptions = {
        from: process.env.MAIL_SENDER,
        to: studentDoc.email,
        subject: "Welcome to APC Nadiad",

        html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html
          dir="ltr"
          xmlns="http://www.w3.org/1999/xhtml"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          lang="en"
        >
          <head>
            <meta charset="UTF-8" />
            <meta content="width=device-width, initial-scale=1" name="viewport" />
            <meta name="x-apple-disable-message-reformatting" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta content="telephone=no" name="format-detection" />
            <title>New email template 2024-03-15</title>
            <!--[if (mso 16)
              ]><style type="text/css">
                a {
                  text-decoration: none;
                }
              </style><!
            [endif]-->
            <!--[if gte mso 9
              ]><style>
                sup {
                  font-size: 100% !important;
                }
              </style><!
            [endif]-->
            <!--[if gte mso 9
              ]><xml>
                <o:OfficeDocumentSettings>
                  <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <link
              href="https://fonts.googleapis.com/css2?family=Orbitron&display=swap"
              rel="stylesheet"
            />
            <!--<![endif]-->
            <style type="text/css">
              .rollover span {
                font-size: 0px;
              }
              u + .body img ~ div div {
                display: none;
              }
              #outlook a {
                padding: 0;
              }
              span.MsoHyperlink,
              span.MsoHyperlinkFollowed {
                color: inherit;
                mso-style-priority: 99;
              }
              a.es-button {
                mso-style-priority: 100 !important;
                text-decoration: none !important;
              }
              a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
              }
              .es-desk-hidden {
                display: none;
                float: left;
                overflow: hidden;
                width: 0;
                max-height: 0;
                line-height: 0;
                mso-hide: all;
              }
              .es-left {
                float: left;
              }
              .es-right {
                float: right;
              }
              .es-menu td {
                border: 0;
              }
              .es-menu td a img {
                display: inline !important;
                vertical-align: middle;
              }
              s {
                text-decoration: line-through;
              }
              ul,
              ol {
                font-family: arial, "helvetica neue", helvetica, sans-serif;
                padding: 0px 0px 0px 40px;
                margin: 15px 0px;
              }
              ul li {
                color: rgb(51, 51, 51);
              }
              ol li {
                color: rgb(51, 51, 51);
              }
              li {
                margin: 0px 0px 15px;
                font-size: 14px;
              }
              .es-menu td a {
                font-family: arial, "helvetica neue", helvetica, sans-serif;
                text-decoration: none;
                display: block;
              }
              .es-header {
                background-color: transparent;
                background-repeat: repeat;
                background-position: center top;
              }
              .es-header-body {
                background-color: rgb(255, 255, 255);
              }
              .es-header-body p {
                color: rgb(51, 51, 51);
                font-size: 14px;
              }
              .es-header-body a {
                color: rgb(38, 198, 218);
                font-size: 14px;
              }
              .es-footer {
                background-color: transparent;
                background-repeat: repeat;
                background-position: center top;
              }
              .es-footer-body {
                background-color: rgb(255, 255, 255);
              }
              .es-footer-body p {
                color: rgb(51, 51, 51);
                font-size: 14px;
              }
              .es-footer-body a {
                color: rgb(255, 255, 255);
                font-size: 14px;
              }
              .es-infoblock p {
                font-size: 12px;
                color: rgb(204, 204, 204);
              }
              .es-infoblock a {
                font-size: 12px;
                color: rgb(204, 204, 204);
              }
              h2 {
                font-size: 36px;
                font-style: normal;
                font-weight: bold;
                line-height: 120%;
                color: rgb(16, 5, 77);
              }
              h3 {
                font-size: 28px;
                font-style: normal;
                font-weight: bold;
                line-height: 120%;
                color: rgb(16, 5, 77);
              }
              h4 {
                font-size: 24px;
                font-style: normal;
                font-weight: normal;
                line-height: 120%;
                color: rgb(51, 51, 51);
              }
              h5 {
                font-size: 20px;
                font-style: normal;
                font-weight: normal;
                line-height: 120%;
                color: rgb(51, 51, 51);
              }
              .es-header-body h1 a,
              .es-content-body h1 a,
              .es-footer-body h1 a {
                font-size: 44px;
              }
              .es-header-body h2 a,
              .es-content-body h2 a,
              .es-footer-body h2 a {
                font-size: 36px;
              }
              .es-header-body h3 a,
              .es-content-body h3 a,
              .es-footer-body h3 a {
                font-size: 28px;
              }
              .es-header-body h4 a,
              .es-content-body h4 a,
              .es-footer-body h4 a {
                font-size: 24px;
              }
              .es-header-body h5 a,
              .es-content-body h5 a,
              .es-footer-body h5 a {
                font-size: 20px;
              }
              .es-header-body h6 a,
              .es-content-body h6 a,
              .es-footer-body h6 a {
                font-size: 16px;
              }
              a.es-button,
              button.es-button {
                padding: 10px 25px 10px 30px;
                display: inline-block;
                background: rgb(38, 198, 218);
                border-radius: 10px 10px 10px 10px;
                font-size: 20px;
                font-family: arial, "helvetica neue", helvetica, sans-serif;
                font-weight: normal;
                font-style: normal;
                line-height: 120%;
                color: rgb(255, 255, 255);
                text-decoration: none !important;
                width: auto;
                text-align: center;
                letter-spacing: 0;
                mso-padding-alt: 0;
                mso-border-alt: 10px solid rgb(38, 198, 218);
              }
              .es-button-border {
                border-style: solid;
                border-color: rgb(38, 198, 218) rgb(38, 198, 218) rgb(38, 198, 218)
                  rgb(38, 198, 218);
                background: rgb(38, 198, 218);
                border-width: 4px 4px 4px 4px;
                display: inline-block;
                border-radius: 10px 10px 10px 10px;
                width: auto;
              }
              .es-button img {
                display: inline-block;
                vertical-align: middle;
              }
              .es-fw,
              .es-fw .es-button {
                display: block;
              }
              .es-il,
              .es-il .es-button {
                display: inline-block;
              }
              .es-text-rtl h1,
              .es-text-rtl h2,
              .es-text-rtl h3,
              .es-text-rtl h4,
              .es-text-rtl h5,
              .es-text-rtl h6,
              .es-text-rtl input,
              .es-text-rtl label,
              .es-text-rtl textarea,
              .es-text-rtl p,
              .es-text-rtl ol,
              .es-text-rtl ul,
              .es-text-rtl .es-menu a,
              .es-text-rtl .es-table {
                direction: rtl;
              }
              .es-text-ltr h1,
              .es-text-ltr h2,
              .es-text-ltr h3,
              .es-text-ltr h4,
              .es-text-ltr h5,
              .es-text-ltr h6,
              .es-text-ltr input,
              .es-text-ltr label,
              .es-text-ltr textarea,
              .es-text-ltr p,
              .es-text-ltr ol,
              .es-text-ltr ul,
              .es-text-ltr .es-menu a,
              .es-text-ltr .es-table {
                direction: ltr;
              }
              .es-text-rtl ol,
              .es-text-rtl ul {
                padding: 0px 40px 0px 0px;
              }
              .es-text-ltr ul,
              .es-text-ltr ol {
                padding: 0px 0px 0px 40px;
              }
              .es-p-default {
                padding-top: 20px;
                padding-right: 20px;
                padding-bottom: 0px;
                padding-left: 20px;
              }
              @media only screen and (max-width: 600px) {
                .es-m-p0r {
                  padding-right: 0px !important;
                }
                .es-m-p20b {
                  padding-bottom: 20px !important;
                }
                *[class="gmail-fix"] {
                  display: none !important;
                }
                p,
                a {
                  line-height: 150% !important;
                }
                h1,
                h1 a {
                  line-height: 120% !important;
                }
                h2,
                h2 a {
                  line-height: 120% !important;
                }
                h3,
                h3 a {
                  line-height: 120% !important;
                }
                h4,
                h4 a {
                  line-height: 120% !important;
                }
                h5,
                h5 a {
                  line-height: 120% !important;
                }
                h6,
                h6 a {
                  line-height: 120% !important;
                }
                h1 {
                  font-size: 30px !important;
                  text-align: center;
                }
                h2 {
                  font-size: 24px !important;
                  text-align: left;
                }
                h3 {
                  font-size: 20px !important;
                  text-align: left;
                }
                h4 {
                  font-size: 24px !important;
                  text-align: left;
                }
                h5 {
                  font-size: 20px !important;
                  text-align: left;
                }
                h6 {
                  font-size: 16px !important;
                  text-align: left;
                }
                .es-header-body h1 a,
                .es-content-body h1 a,
                .es-footer-body h1 a {
                  font-size: 30px !important;
                }
                .es-header-body h2 a,
                .es-content-body h2 a,
                .es-footer-body h2 a {
                  font-size: 24px !important;
                }
                .es-header-body h3 a,
                .es-content-body h3 a,
                .es-footer-body h3 a {
                  font-size: 20px !important;
                }
                .es-header-body h4 a,
                .es-content-body h4 a,
                .es-footer-body h4 a {
                  font-size: 24px !important;
                }
                .es-header-body h5 a,
                .es-content-body h5 a,
                .es-footer-body h5 a {
                  font-size: 20px !important;
                }
                .es-header-body h6 a,
                .es-content-body h6 a,
                .es-footer-body h6 a {
                  font-size: 16px !important;
                }
                .es-menu td a {
                  font-size: 14px !important;
                }
                .es-header-body p,
                .es-header-body a {
                  font-size: 14px !important;
                }
                .es-content-body p,
                .es-content-body a {
                  font-size: 14px !important;
                }
                .es-footer-body p,
                .es-footer-body a {
                  font-size: 14px !important;
                }
                .es-infoblock p,
                .es-infoblock a {
                  font-size: 12px !important;
                }
                .es-m-txt-c,
                .es-m-txt-c h1,
                .es-m-txt-c h2,
                .es-m-txt-c h3,
                .es-m-txt-c h4,
                .es-m-txt-c h5,
                .es-m-txt-c h6 {
                  text-align: center !important;
                }
                .es-m-txt-r,
                .es-m-txt-r h1,
                .es-m-txt-r h2,
                .es-m-txt-r h3,
                .es-m-txt-r h4,
                .es-m-txt-r h5,
                .es-m-txt-r h6 {
                  text-align: right !important;
                }
                .es-m-txt-j,
                .es-m-txt-j h1,
                .es-m-txt-j h2,
                .es-m-txt-j h3,
                .es-m-txt-j h4,
                .es-m-txt-j h5,
                .es-m-txt-j h6 {
                  text-align: justify !important;
                }
                .es-m-txt-l,
                .es-m-txt-l h1,
                .es-m-txt-l h2,
                .es-m-txt-l h3,
                .es-m-txt-l h4,
                .es-m-txt-l h5,
                .es-m-txt-l h6 {
                  text-align: left !important;
                }
                .es-m-txt-r img,
                .es-m-txt-c img,
                .es-m-txt-l img {
                  display: inline !important;
                }
                .es-m-txt-r .rollover:hover .rollover-second,
                .es-m-txt-c .rollover:hover .rollover-second,
                .es-m-txt-l .rollover:hover .rollover-second {
                  display: inline !important;
                }
                .es-m-txt-r .rollover span,
                .es-m-txt-c .rollover span,
                .es-m-txt-l .rollover span {
                  line-height: 0 !important;
                  font-size: 0 !important;
                }
                .es-spacer {
                  display: inline-table;
                }
                a.es-button,
                button.es-button {
                  font-size: 18px !important;
                  line-height: 120% !important;
                }
                a.es-button,
                button.es-button,
                .es-button-border {
                  display: inline-block !important;
                }
                .es-m-fw,
                .es-m-fw.es-fw,
                .es-m-fw .es-button {
                  display: block !important;
                }
                .es-m-il,
                .es-m-il .es-button,
                .es-social,
                .es-social td,
                .es-menu {
                  display: inline-block !important;
                }
                .es-adaptive table,
                .es-left,
                .es-right {
                  width: 100% !important;
                }
                .es-content table,
                .es-header table,
                .es-footer table,
                .es-content,
                .es-footer,
                .es-header {
                  width: 100% !important;
                  max-width: 600px !important;
                }
                .adapt-img {
                  width: 100% !important;
                  height: auto !important;
                }
                .es-mobile-hidden,
                .es-hidden {
                  display: none !important;
                }
                .es-desk-hidden {
                  width: auto !important;
                  overflow: visible !important;
                  float: none !important;
                  max-height: inherit !important;
                  line-height: inherit !important;
                }
                tr.es-desk-hidden {
                  display: table-row !important;
                }
                table.es-desk-hidden {
                  display: table !important;
                }
                td.es-desk-menu-hidden {
                  display: table-cell !important;
                }
                .es-menu td {
                  width: 1% !important;
                }
                table.es-table-not-adapt,
                .esd-block-html table {
                  width: auto !important;
                }
                .es-social td {
                  padding-bottom: 10px;
                }
                .h-auto {
                  height: auto !important;
                }
              }
              @media screen and (max-width: 384px) {
                .mail-message-content {
                  width: 414px !important;
                }
              }
            </style>
          </head>
          <body class="body" style="width: 100%; height: 100%; padding: 0; margin: 0">
            <div
              dir="ltr"
              class="es-wrapper-color"
              lang="en"
              style="background-color: #07023c"
            >
              <!--[if gte mso 9
                ]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                  <v:fill type="tile" color="#07023c"></v:fill> </v:background
              ><![endif]-->
              <table
                class="es-wrapper"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                role="none"
                style="
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                  border-collapse: collapse;
                  border-spacing: 0px;
                  padding: 0;
                  margin: 0;
                  width: 100%;
                  height: 100%;
                  background-repeat: repeat;
                  background-position: center top;
                  background-color: #07023c;
                "
              >
                <tr>
                  <td valign="top" style="padding: 0; margin: 0">
                    <table
                      class="es-content"
                      cellspacing="0"
                      cellpadding="0"
                      align="center"
                      role="none"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        border-collapse: collapse;
                        border-spacing: 0px;
                        width: 100%;
                        table-layout: fixed !important;
                      "
                    >
                      <tr>
                        <td align="center" style="padding: 0; margin: 0">
                          <table
                            class="es-content-body"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              border-collapse: collapse;
                              border-spacing: 0px;
                              background-color: #ffffff;
                              background-repeat: no-repeat;
                              width: 600px;
                              background-image: url(https://eezhzut.stripocdn.email/content/guids/CABINET_0e8fbb6adcc56c06fbd3358455fdeb41/images/vector_0Ia.png);
                              background-position: center center;
                            "
                            cellspacing="0"
                            cellpadding="0"
                            bgcolor="#ffffff"
                            align="center"
                            background="https://eezhzut.stripocdn.email/content/guids/CABINET_0e8fbb6adcc56c06fbd3358455fdeb41/images/vector_0Ia.png"
                            role="none"
                          >
                            <tr>
                              <td
                                align="left"
                                style="
                                  margin: 0;
                                  padding-top: 20px;
                                  padding-right: 20px;
                                  padding-bottom: 10px;
                                  padding-left: 20px;
                                "
                              >
                                <table
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  role="none"
                                  style="
                                    mso-table-lspace: 0pt;
                                    mso-table-rspace: 0pt;
                                    border-collapse: collapse;
                                    border-spacing: 0px;
                                  "
                                >
                                  <tr>
                                    <td
                                      class="es-m-p0r"
                                      valign="top"
                                      align="center"
                                      style="padding: 0; margin: 0; width: 560px"
                                    >
                                      <table
                                        cellpadding="0"
                                        cellspacing="0"
                                        width="100%"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                          border-collapse: collapse;
                                          border-spacing: 0px;
                                        "
                                      >
                                        <tr>
                                          <td
                                            align="center"
                                            style="
                                              padding: 0;
                                              margin: 0;
                                              font-size: 0px;
                                            "
                                          >
                                            <a
                                              target="_blank"
                                              href="https://apcnadiad.netlify.app"
                                              style="
                                                mso-line-height-rule: exactly;
                                                text-decoration: underline;
                                                color: #26c6da;
                                                font-size: 14px;
                                              "
                                              ><img
                                                src="https://raw.githubusercontent.com/DhavalDudheliya/Hostel_Management_Frontend/main/src/assets/logo.png"
                                                alt="Logo"
                                                style="
                                                  display: block;
                                                  font-size: 14px;
                                                  border: 0;
                                                  outline: none;
                                                  text-decoration: none;
                                                "
                                                title="Logo"
                                                height="55"
                                                width="66"
                                            /></a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td
                                align="left"
                                style="
                                  margin: 0;
                                  padding-right: 20px;
                                  padding-left: 20px;
                                  padding-top: 30px;
                                  padding-bottom: 30px;
                                "
                              >
                                <table
                                  width="100%"
                                  cellspacing="0"
                                  cellpadding="0"
                                  role="none"
                                  style="
                                    mso-table-lspace: 0pt;
                                    mso-table-rspace: 0pt;
                                    border-collapse: collapse;
                                    border-spacing: 0px;
                                  "
                                >
                                  <tr>
                                    <td
                                      class="es-m-p0r es-m-p20b"
                                      valign="top"
                                      align="center"
                                      style="padding: 0; margin: 0; width: 560px"
                                    >
                                      <table
                                        width="100%"
                                        cellspacing="0"
                                        cellpadding="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                          border-collapse: collapse;
                                          border-spacing: 0px;
                                        "
                                      >
                                        <tr>
                                          <td
                                            align="center"
                                            style="padding: 0; margin: 0"
                                          >
                                            <h1
                                              style="
                                                margin: 0;
                                                font-family: Orbitron, sans-serif;
                                                mso-line-height-rule: exactly;
                                                letter-spacing: 0;
                                                font-size: 44px;
                                                font-style: normal;
                                                font-weight: bold;
                                                line-height: 53px;
                                                color: #10054d;
                                              "
                                            >
                                              Welcome to&nbsp;
                                            </h1>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                            align="center"
                                            style="padding: 0; margin: 0"
                                          >
                                            <h1
                                              style="
                                                margin: 0;
                                                font-family: Orbitron, sans-serif;
                                                mso-line-height-rule: exactly;
                                                letter-spacing: 0;
                                                font-size: 44px;
                                                font-style: normal;
                                                font-weight: bold;
                                                line-height: 53px;
                                                color: #10054d;
                                              "
                                            >
                                              APC NADIAD
                                            </h1>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                            align="center"
                                            style="
                                              margin: 0;
                                              padding-bottom: 10px;
                                              padding-top: 10px;
                                              padding-right: 30px;
                                              padding-left: 25px;
                                            "
                                          >
                                            <p
                                              align="left"
                                              style="
                                                margin: 0;
                                                mso-line-height-rule: exactly;
                                                font-family: arial, 'helvetica neue',
                                                  helvetica, sans-serif;
                                                line-height: 21px;
                                                letter-spacing: 0;
                                                color: #333333;
                                                font-size: 14px;
                                              "
                                            >
                                              ​
                                            </p>
                                            <p
                                              align="left"
                                              style="
                                                margin: 0;
                                                mso-line-height-rule: exactly;
                                                font-family: arial, 'helvetica neue',
                                                  helvetica, sans-serif;
                                                line-height: 21px;
                                                letter-spacing: 0;
                                                color: #333333;
                                                font-size: 14px;
                                              "
                                            >
                                              <strong
                                                >Dear ${studentDoc.firstName}
                                                ${studentDoc.lastName},</strong
                                              >
                                            </p>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                            align="center"
                                            style="
                                              margin: 0;
                                              padding-bottom: 10px;
                                              padding-top: 10px;
                                              padding-left: 25px;
                                              padding-right: 25px;
                                            "
                                          >
                                            <p
                                              align="left"
                                              style="
                                                margin: 0;
                                                mso-line-height-rule: exactly;
                                                font-family: arial, 'helvetica neue',
                                                  helvetica, sans-serif;
                                                line-height: 21px;
                                                letter-spacing: 0;
                                                color: #333333;
                                                font-size: 14px;
                                              "
                                            >
                                              We are delighted to inform you that you
                                              are now a member of APC Nadiad community!
                                              Welcome!
                                            </p>
                                            <p
                                              align="left"
                                              style="
                                                margin: 0;
                                                mso-line-height-rule: exactly;
                                                font-family: arial, 'helvetica neue',
                                                  helvetica, sans-serif;
                                                line-height: 21px;
                                                letter-spacing: 0;
                                                color: #333333;
                                                font-size: 14px;
                                              "
                                            >
                                              ​
                                            </p>
                                            <p
                                              align="left"
                                              style="
                                                margin: 0;
                                                mso-line-height-rule: exactly;
                                                font-family: arial, 'helvetica neue',
                                                  helvetica, sans-serif;
                                                line-height: 21px;
                                                letter-spacing: 0;
                                                color: #333333;
                                                font-size: 14px;
                                              "
                                            >
                                              Your login details for the hostel web
                                              portal are as follows:
                                            </p>
                                            <h1
                                              align="left"
                                              style="
                                                margin: 0;
                                                font-family: Orbitron, sans-serif;
                                                mso-line-height-rule: exactly;
                                                letter-spacing: 0;
                                                font-size: 44px;
                                                font-style: normal;
                                                font-weight: bold;
                                                line-height: 53px;
                                                color: #10054d;
                                              "
                                            >
                                              ​
                                            </h1>
                                            <h6
                                              align="center"
                                              style="
                                                margin: 0;
                                                font-family: Orbitron, sans-serif;
                                                mso-line-height-rule: exactly;
                                                letter-spacing: 0;
                                                font-size: 16px;
                                                font-style: normal;
                                                font-weight: normal;
                                                line-height: 19px;
                                                color: #333333;
                                              "
                                            >
                                              <strong
                                                >​Username:
                                                &nbsp;${studentDoc.email}</strong
                                              >
                                            </h6>
                                            <h6
                                              align="center"
                                              style="
                                                margin: 0;
                                                font-family: Orbitron, sans-serif;
                                                mso-line-height-rule: exactly;
                                                letter-spacing: 0;
                                                font-size: 16px;
                                                font-style: normal;
                                                font-weight: normal;
                                                line-height: 19px;
                                                color: #333333;
                                              "
                                            >
                                              <strong
                                                >Password: &nbsp;${plainPassword}</strong
                                              >
                                            </h6>
                                            <p
                                              align="center"
                                              style="
                                                margin: 0;
                                                mso-line-height-rule: exactly;
                                                font-family: arial, 'helvetica neue',
                                                  helvetica, sans-serif;
                                                line-height: 21px;
                                                letter-spacing: 0;
                                                color: #333333;
                                                font-size: 14px;
                                              "
                                            >
                                              <strong>​</strong>
                                            </p>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                            align="center"
                                            style="
                                              margin: 0;
                                              padding-bottom: 10px;
                                              padding-top: 10px;
                                              padding-left: 25px;
                                              padding-right: 25px;
                                            "
                                          >
                                            <p
                                              style="
                                                margin: 0;
                                                mso-line-height-rule: exactly;
                                                font-family: arial, 'helvetica neue',
                                                  helvetica, sans-serif;
                                                line-height: 21px;
                                                letter-spacing: 0;
                                                color: #333333;
                                                font-size: 14px;
                                              "
                                            >
                                              You can change your password from portal.
                                            </p>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td
                                align="left"
                                style="
                                  margin: 0;
                                  padding-top: 20px;
                                  padding-right: 20px;
                                  padding-bottom: 10px;
                                  padding-left: 20px;
                                "
                              >
                                <table
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  role="none"
                                  style="
                                    mso-table-lspace: 0pt;
                                    mso-table-rspace: 0pt;
                                    border-collapse: collapse;
                                    border-spacing: 0px;
                                  "
                                >
                                  <tr>
                                    <td
                                      class="es-m-p0r"
                                      valign="top"
                                      align="center"
                                      style="padding: 0; margin: 0; width: 560px"
                                    >
                                      <table
                                        cellpadding="0"
                                        cellspacing="0"
                                        width="100%"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                          border-collapse: collapse;
                                          border-spacing: 0px;
                                        "
                                      >
                                        <tr>
                                          <td
                                            align="center"
                                            style="
                                              padding: 0;
                                              margin: 0;
                                              font-size: 0px;
                                            "
                                          >
                                            <a
                                              target="_blank"
                                              href="https://apcnadiad.netlify.app"
                                              style="
                                                mso-line-height-rule: exactly;
                                                text-decoration: underline;
                                                color: #26c6da;
                                                font-size: 14px;
                                              "
                                              ><img
                                                src="https://raw.githubusercontent.com/DhavalDudheliya/Hostel_Management_Frontend/main/src/assets/logo.png"
                                                alt="Logo"
                                                style="
                                                  display: block;
                                                  font-size: 14px;
                                                  border: 0;
                                                  outline: none;
                                                  text-decoration: none;
                                                "
                                                title="Logo"
                                                height="55"
                                                width="66"
                                            /></a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
          </body>
        </html>
        

      `,
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json(studentDoc);
    } else {
      return res.status(400).json({ message: "Cannot add Student" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const {
      rollNumber,
      firstName,
      lastName,
      dateOfBirth,
      cast,
      bloodGroup,
      permenantDisease,
      mobileNumber,
      whatsappNumber,
      email,
      fatherFirstName,
      fatherEmail,
      fatherMiddlename,
      work,
      fatherPhoneNo,
      fatherWhatsappNo,
      street,
      district,
      taluka,
      village,
      postalCode,
      university,
      course,
      branch,
      lastExam,
      lastExamPercentage,
      lastSchoolName,
    } = req.body;

    const student = await Student.findOne({ rollNumber: rollNumber });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.set({
      firstName,
      lastName,
      dateOfBirth,
      cast,
      bloodGroup,
      permenantDisease,
      mobileNumber,
      whatsappNumber,
      email,
      fatherFirstName,
      fatherEmail,
      fatherMiddlename,
      work,
      fatherPhoneNo,
      fatherWhatsappNo,
      address: {
        street,
        village,
        taluka,
        district,
        postalCode,
      },
      university,
      course,
      branch,
      lastExam,
      lastExamPercentage,
      lastSchoolName,
    });
    await student.save();

    const UpdatedStudent = await Student.findOne({
      rollNumber: rollNumber,
    }).populate(["leaves", "fees"]);

    if (UpdatedStudent) {
      res.status(200).json({
        message: "Student profile updated successfully",
        UpdatedStudent,
      });
    }
  } catch (error) {
    res.status(400).json({ error: "Internal Server Error" });
  }
};

const getActiveSeries = async (req, res) => {
  try {
    const rollNoDoc = await RollNo.find();
    res.statusjson(rollNoDoc);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

const generateRollNumber = async (req, res) => {
  try {
    const { range } = req.body;

    // Check if the 'range' parameter is provided
    if (!range) {
      return res.status(400).json({ error: "Range parameter is missing" });
    }

    const [start, end] = range.split("-").map(Number);

    // Find all existing roll numbers within the specified range
    const existingNumbers = await Student.find({
      rollNumber: { $gte: start, $lte: end },
    }).distinct("rollNumber");

    // const existingNumbers = [101, 102, 103, 104, 105, 106, 110];

    const existingNumberSet = new Set(existingNumbers);

    // Find the smallest available roll number within the range
    let smallestAvailableNumber = start;
    while (existingNumberSet.has(smallestAvailableNumber)) {
      smallestAvailableNumber++;
      if (smallestAvailableNumber > end) {
        // If no available roll number is found within the range
        return res.status(400).json({
          error: "No available roll numbers within the specified range",
        });
      }
    }

    res.json({ rollNumber: smallestAvailableNumber });
  } catch (error) {
    console.log("Error generating roll number:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSearchSuggestionStudent = async (req, res) => {
  try {
    const query = req.query.q;

    const isNumeric = !isNaN(query);

    let students;

    if (isNumeric) {
      const allStudents = await Student.find({}, "rollNumber");
      const rollNumbers = allStudents.map((student) =>
        student.rollNumber.toString()
      );
      const matchingRollNumbers = rollNumbers.filter((rollNumber) =>
        rollNumber.includes(query)
      );
      const numericRollNumbers = matchingRollNumbers.map(Number);
      students = await Student.find({
        rollNumber: { $in: numericRollNumbers },
      }).populate(["leaves", "fees"]);
    } else {
      students = await Student.find({
        $or: [
          { firstName: { $regex: new RegExp(query), $options: "i" } },
          { lastName: { $regex: new RegExp(query), $options: "i" } },
        ],
      }).populate(["leaves", "fees"]);
    }

    // console.log(students);

    res.status(200).json({ message: "Students ", students });
  } catch (error) {
    console.log("Error in getting Students: ", error);
    res.status(400).json({ error: "Internal Server Error" });
  }
};

const allocateBlock = async (req, res) => {
  try {
    const { name, start, end, capacity } = req.body;
    const isAllocated = await Blocks.findOne({ name: name });
    if (isAllocated) {
      await isAllocated.save();
      return res.status(409).json(isAllocated);
    } else {
      const blockCapacity = (end - start + 1) * capacity;
      const blockDoc = await Blocks.create({
        name: name,
        blockCapacity: blockCapacity,
        vacancy: blockCapacity,
      });
      blockDoc.rooms = [];
      for (let i = start; i <= end; i++) {
        const room = {
          number: i,
          capacity: capacity,
        };
        blockDoc.rooms.push(room);
      }
      await blockDoc.save();
      const UpdatedBlocks = await Blocks.find({});
      return res
        .status(200)
        .json({ message: "Block added sucessfully", UpdatedBlocks });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

const getAllBlocks = async (req, res) => {
  try {
    const isAllocated = await Blocks.find({});
    return res.status(200).json(isAllocated);
  } catch (error) {
    console.log(error);
    return res.json({ message: `Error occured ${error}` });
  }
};

const allocateStudent = async (req, res) => {
  try {
    const { id } = req.params; // Block ID where we want to allocate the student
    const { roomNumber, rollNo } = req.body; // Room number and student ID


    const studentDoc = await Student.findOne({ rollNumber: rollNo });
    if (studentDoc === "") {
      return res.status(404).json({ message: "Student not found" });
    }
    const studentId = studentDoc._id;

    // Check if the student is already allocated to another block
    const student = await Student.findById(studentId);

    if (student.blockId) {
      // Student is already allocated to a block, deallocate from the current block
      const currentBlock = await Blocks.findById(student.blockId);

      if (currentBlock) {
        currentBlock.filled = currentBlock.filled - 1;
        currentBlock.vacancy = currentBlock.vacancy + 1;
        currentBlock.rooms.forEach((room) => {
          room.allocatedStudents.pull(studentId);
        });
        await currentBlock.save();
      }
    }

    // Find the block with the given ID
    const block = await Blocks.findById(id);

    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    // Find the room in the block with the given roomNumber
    const room = block.rooms.find((room) => room.number === roomNumber);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Allocate the student to the room
    room.allocatedStudents.push(studentId);

    // Update the student's blockId and roomNumber
    student.blockId = block._id;
    student.roomNumber = roomNumber;

    block.filled = block.filled + 1;
    block.vacancy = block.vacancy - 1;

    // Save the changes
    await block.save();
    await student.save();

    const blockDoc = await Blocks.findById(id).populate({
      path: "rooms.allocatedStudents",
      select:
        "-password -role -resetPasswordToken -resetPasswordExpires -createdAt -updatedAt",
    });

    const roomInfo = blockDoc.rooms.find((room) => room.number === roomNumber);
    const UpdatedBlocks = await Blocks.find({});

    return res.status(200).json({ roomInfo, UpdatedBlocks });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occurred: ${error}` });
  }
};

const getBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const blockDoc = await Blocks.findById(id).populate({
      path: "rooms.allocatedStudents",
      model: "Student",
    });

    if (!blockDoc) {
      return res.status(404).json({ message: "Block does not exist" });
    }

    return res.status(200).json(blockDoc);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occurred ${error}` });
  }
};

// Delete Block API
const deleteBlock = async (req, res) => {
  try {
    const { id } = req.params; // Block ID

    // Find the block with the given ID
    const block = await Blocks.findById(id);

    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    // Retrieve the list of allocated students in the block
    const allocatedStudents = block.rooms.reduce(
      (students, room) => students.concat(room.allocatedStudents),
      []
    );

    // Reset the blockId and roomNumber for all allocated students
    await User.updateMany(
      { _id: { $in: allocatedStudents } },
      { blockId: null, roomNumber: null }
    );

    // Delete the block
    await Blocks.findByIdAndDelete(id);

    const UpdatedBlocks = await Blocks.find({});

    return res
      .status(200)
      .json({ message: "Block deleted successfully", UpdatedBlocks });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occurred: ${error}` });
  }
};

/* USER PROFILE PHOTO UPDATE*/
const userProfilePhotoUpdate = async (req, res) => {
  try {
    let profilePhoto;
    if (req.file) {
      profilePhoto = req.file.filename;
    }

    const { studentId } = req.body;

    const studentDoc = await Student.findById(studentId);

    // Delete previous profile photo
    if (studentDoc.profilePhoto) {
      const filePath = path.join("uploads", studentDoc.profilePhoto);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log("Error deleting previous profile photo:", err);
        }
      });
    }

    if (studentDoc) {
      studentDoc.set({
        profilePhoto,
      });
      await studentDoc.save();
      const UpdatedStudent = await Student.findById(studentId);
      res
        .status(200)
        .json({ message: "Photo Updated Succesfully", UpdatedStudent });
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

const applyNOC = async (req, res) => {
  try {
    const { studentId, damagedProperties, propertyFine, remark, date } =
      req.body;

    const student = await Student.findOne({ _id: studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const formerStudentSchema = await FormerStudent.create({
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      mobileNumber: student.mobileNumber,
      whatsappNumber: student.whatsappNumber,
      email: student.email,
      damagedProperties: damagedProperties,
      propertyFine: propertyFine,
      remark: remark,
      date: date,
      startYear: moment(student.admissionDate).format("YYYY"),
      endYear: moment(Date.now()).format("YYYY"),
    });

    if (formerStudentSchema) {
      // delete user
      await User.findOneAndDelete({ email: student.email });

      const fees = await FeeSchema.find({ student: student._id });

      // Check the status of each fee
      const pendingFees = fees.filter((fee) => fee.paymentStatus != "Paid");
      const paidFees = fees.filter((fee) => fee.paymentStatus === "Paid");

      // Now you can decide whether to proceed with deletion based on the status of fees
      if (pendingFees.length === 0 && paidFees.length === 0) {
        console.log("No fees found for the student.");
      } else if (pendingFees.length > 0) {
        console.log("There are pending fees of student");
        return res
          .status(409)
          .json({ message: "There are pending fees of student" });
      } else {
        // Perform deletion here
        await FeeSchema.deleteMany({ student: studentId });
        console.log(
          "Fees associated with student ID",
          studentId,
          "deleted successfully."
        );
      }

      // remove student from room
      // Find the block by ID
      const block = await Blocks.findById(student.blockId);

      if (block) {
        // Find the index of the room with the specified room number
        const roomIndex = block.rooms.findIndex(
          (room) => room.number === student.roomNumber
        );

        if (roomIndex !== -1) {
          // Remove the student ID from the allocatedStudents array of the room
          block.rooms[roomIndex].allocatedStudents.pull(student._id);

          block.filled = block.filled - 1;
          block.vacancy = block.vacancy + 1;

          // Save the updated block
          await block.save();

          console.log(`Student removed from room ${student.roomNumber}`);
        } else {
          console.log(`Room not found in block `);
        }
      } else {
        console.log(`Block not found.`);
      }

      // Now delete all Leaves entry
      await Leaves.deleteMany({ student: student._id });
      console.log("delete leaves");

      //Delete all reports
      await Report.deleteMany({ author: student._id });
      console.log("delete reports");

      // Finally delete student
      await Student.deleteOne({ _id: studentId });

      return res.status(200).json({ message: "NOC applied successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

// Query the Leave model to find leaves that overlap with the given date range
async function findStudentsPresentByDateRange(startDate, endDate) {
  try {
    // console.log(startDate);
    // console.log(endDate);
    startDate = moment(startDate, "DD-MM-YYYY").toDate();
    endDate = moment(endDate, "DD-MM-YYYY").toDate();

    // console.log(startDate);
    // console.log(endDate);

    const leaves = await Leaves.find({
      $or: [
        {
          $and: [
            { startDate: { $lte: endDate } }, // Leave starts before or on the end date
            { endDate: { $gte: startDate } }, // Leave ends after or on the start date
          ],
        },
      ],
    });

    // console.log(leaves);

    // Extract unique student IDs from leaves
    const studentIdsOnLeave = leaves.map((leave) => leave.student.toString());

    // Query the Student model to find the count of students not on leave
    const studentsPresentCount = await Student.countDocuments({
      _id: { $nin: studentIdsOnLeave },
    });

    return studentsPresentCount;
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
}

// Usage example
const getPresentStudentsCountOfFourDays = async (req, res) => {
  try {
    // Define the date ranges for yesterday, today, and the next two days
    const yesterday = moment().subtract(1, "days").format("DD-MM-YYYY");
    const today = moment().format("DD-MM-YYYY");
    const tomorrow = moment().add(1, "days").format("DD-MM-YYYY");
    const dayAfterTomorrow = moment().add(2, "days").format("DD-MM-YYYY");

    const studentsCountYesterday = await findStudentsPresentByDateRange(
      yesterday,
      yesterday
    );
    const studentsCountToday = await findStudentsPresentByDateRange(
      today,
      today
    );
    const studentsCountTomorrow = await findStudentsPresentByDateRange(
      tomorrow,
      tomorrow
    );
    const studentsCountDayAfterTomorrow = await findStudentsPresentByDateRange(
      dayAfterTomorrow,
      dayAfterTomorrow
    );

    // console.log("Students present yesterday:", studentsCountYesterday);
    // console.log("Students present today:", studentsCountToday);
    // console.log("Students present tomorrow:", studentsCountTomorrow);
    // console.log(
    //   "Students present day after tomorrow:",
    //   studentsCountDayAfterTomorrow
    // );

    const totalStudents = await Student.countDocuments({});

    // console.log(totalStudents);

    return res.status(200).json({
      studentsCountYesterday,
      studentsCountToday,
      studentsCountTomorrow,
      studentsCountDayAfterTomorrow,
      totalStudents,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

const getCountsForDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({});
    const pendingFees = await FeeSchema.countDocuments({
      paymentStatus: "Pending",
    });
    const partialFees = await FeeSchema.countDocuments({
      paymentStatus: "Partial",
    });

    const today = new Date();

    const students = await Student.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $dayOfMonth: "$dateOfBirth" }, { $dayOfMonth: new Date() }],
          },
        },
      },
    ]);

    return res
      .status(200)
      .json({ totalStudents, pendingFees, partialFees, students });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

getCountOfVacancy = async (req, res) => {
  try {
    let totalAvailability = 0;
    let totalVacancy = 0;
    let totalFilled = 0;
    const blocks = await Blocks.find({});
    blocks.map(
      (block) => (totalAvailability = totalAvailability + block.blockCapacity)
    );
    blocks.map((block) => (totalVacancy = totalVacancy + block.vacancy));
    blocks.map((block) => (totalFilled = totalFilled + block.filled));
    const blocksWithFilter = await Blocks.find({}, { filled: 1, vacancy: 1 });

    return res
      .status(200)
      .json({ totalAvailability, totalVacancy, totalFilled, blocksWithFilter });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

module.exports = {
  getAllStudents,
  getActiveSeries,
  createStudent,
  generateRollNumber,
  getSearchSuggestionStudent,
  allocateBlock,
  getAllBlocks,
  allocateStudent,
  getBlock,
  deleteBlock,
  userProfilePhotoUpdate,
  updateStudentProfile,
  applyNOC,
  getPresentStudentsCountOfFourDays,
  getCountsForDashboard,
  getCountOfVacancy,
};

// const allocateRollNo = async (req, res) => {
//   try {
//     const currentYear = new Date().getFullYear();
//     const isYear = await RollNo.findOne({ year: currentYear });
//     if (isYear) {
//       isYear.current = isYear.current + 1;
//       await isYear.save();
//       res.status(200).json({ year: currentYear, current: isYear.current });
//     } else {
//       RollNo.create({
//         year: currentYear,
//         current: `${currentYear}001`,
//       });
//       res.status(200).json({ year: currentYear, current: `${currentYear}001` });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.json({ message: `Error occured ${error}` });
//   }
// };

// const getCurrentRollNo = async (req, res) => {
//   try {
//     const currentYear = new Date().getFullYear();
//     const isYear = await RollNo.findOne({ year: currentYear });

//     if (isYear) {
//       // Find the highest existing roll number for the current year
//       const highestRollNo = await RollNo.findOne({ year: currentYear }).sort({
//         current: -1,
//       }); // Sort in descending order to get the highest roll number

//       const nextRollNo = highestRollNo ? highestRollNo.current + 1 : 1;

//       res.status(200).json({ year: currentYear, current: nextRollNo });
//     } else {
//       RollNo.create({
//         year: currentYear,
//         current: `${currentYear}001`, // Start with 001 for a new year
//       });
//       res
//         .status(200)
//         .json({ year: currentYear, current: Number(`${currentYear}001`) });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.json({ message: `Error occured ${error}` });
//   }
// };

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const crypto = require("crypto");
const nodemailer = require("nodemailer");

/* SALT */
const salt = bcrypt.genSaltSync(10);

/* REGISTER */
const registerUser = async (req, res) => {
  try {
    const {
      role,
      firstName,
      lastName,
      email,
      personalPhoneNo,
      personalWhatsappNo,
      password,
    } = req.body;
    let profilePhoto;

    if (req.file) {
      profilePhoto = req.file.filename;
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, salt);

    const userDoc = await User.create({
      role,
      firstName,
      lastName,
      email,
      personalPhoneNo,
      personalWhatsappNo,
      password: hashedPassword,
    });

    return res.status(200).json(userDoc);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

/* LOGIN */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (!userExists) {
      return res.status(404).json({ message: "User does not exists" });
    }

    const decodedPassword = bcrypt.compareSync(password, userExists.password);

    if (!decodedPassword) {
      return res.status(401).json({ message: "Wrong credentials" });
    }

    const token = jwt.sign({ _id: userExists._id }, process.env.JWT_SECRET, {});

    if (!token) {
      return res.status(401).json({ message: "Token is not generated" });
    }

    return res
      .cookie("_token", token, {
        expires: new Date(Date.now() + 86400000),
        sameSite: "none",
        secure: true,
        httpOnly: true,
      })
      .status(201)
      .json(userExists);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

/* LOGOUT */
const logoutUser = (req, res) => {
  try {
    const { _token } = req.cookies;
    if (_token) {
      res.status(201).clearCookie("_token").json(true);
    } else {
      res.status(404).json(false);
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

/* PROFILE */
const getProfile = (req, res) => {
  try {
    return res.status(201).json(req.user);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

/* UPDATE STIDENT PROFILE */
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    const studentDoc = await User.findById(id);

    if (!studentDoc) {
      return res.status(404).json({ message: "User does not exists" });
    }

    studentDoc.set({
      name,
      phone,
    });
    await studentDoc.save();
    res.status(200).json(studentDoc);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find the user with the provided reset token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = bcrypt.hashSync(password, salt);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user with the provided email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token and its expiration time
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour

    // Store the reset token and its expiration time in the user's document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiration;
    await user.save();

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
      to: user.email,
      subject: "Password Reset",

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
      #outlook a {
        padding: 0;
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
      .es-p5 {
        padding: 5px;
      }
      .es-p5t {
        padding-top: 5px;
      }
      .es-p5b {
        padding-bottom: 5px;
      }
      .es-p5l {
        padding-left: 5px;
      }
      .es-p5r {
        padding-right: 5px;
      }
      .es-p10 {
        padding: 10px;
      }
      .es-p10l {
        padding-left: 10px;
      }
      .es-p10r {
        padding-right: 10px;
      }
      .es-p15 {
        padding: 15px;
      }
      .es-p15l {
        padding-left: 15px;
      }
      .es-p15r {
        padding-right: 15px;
      }
      .es-p20 {
        padding: 20px;
      }
      .es-p20b {
        padding-bottom: 20px;
      }
      .es-p25 {
        padding: 25px;
      }
      .es-p25t {
        padding-top: 25px;
      }
      .es-p25b {
        padding-bottom: 25px;
      }
      .es-p30 {
        padding: 30px;
      }
      .es-p30l {
        padding-left: 30px;
      }
      .es-p35 {
        padding: 35px;
      }
      .es-p35t {
        padding-top: 35px;
      }
      .es-p35b {
        padding-bottom: 35px;
      }
      .es-p35l {
        padding-left: 35px;
      }
      .es-p35r {
        padding-right: 35px;
      }
      .es-p40 {
        padding: 40px;
      }
      .es-p40t {
        padding-top: 40px;
      }
      .es-p40b {
        padding-bottom: 40px;
      }
      .es-p40l {
        padding-left: 40px;
      }
      .es-p40r {
        padding-right: 40px;
      }
      .es-menu td {
        border: 0;
      }
      .es-menu td a img {
        display: inline-block !important;
        vertical-align: middle;
      }
      s {
        text-decoration: line-through;
      }
      ul li,
      ol li {
        margin-bottom: 15px;
        margin-left: 0;
      }
      .es-menu td a {
        text-decoration: none;
        display: block;
        font-family: arial, "helvetica neue", helvetica, sans-serif;
      }
      .es-header {
        background-color: transparent;
        background-repeat: repeat;
        background-position: center top;
      }
      .es-header-body {
        background-color: rgb(255, 255, 255);
      }
      .es-header-body p,
      .es-header-body ul li,
      .es-header-body ol li {
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
      .es-footer-body p,
      .es-footer-body ul li,
      .es-footer-body ol li {
        color: rgb(51, 51, 51);
        font-size: 14px;
      }
      .es-footer-body a {
        color: rgb(255, 255, 255);
        font-size: 14px;
      }
      .es-infoblock,
      .es-infoblock p,
      .es-infoblock ul li,
      .es-infoblock ol li {
        line-height: 120%;
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
        color: rgb(16, 5, 77);
      }
      h3 {
        font-size: 28px;
        font-style: normal;
        font-weight: bold;
        color: rgb(16, 5, 77);
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
      @media only screen and (max-width: 600px) {
        p,
        ul li,
        ol li,
        a {
          line-height: 150% !important;
        }
        h1,
        h2,
        h3,
        h1 a,
        h2 a,
        h3 a {
          line-height: 120%;
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
        .es-header-body h1 a,
        .es-content-body h1 a,
        .es-footer-body h1 a {
          font-size: 30px !important;
          text-align: center;
        }
        .es-header-body h2 a,
        .es-content-body h2 a,
        .es-footer-body h2 a {
          font-size: 24px !important;
          text-align: left;
        }
        .es-header-body h3 a,
        .es-content-body h3 a,
        .es-footer-body h3 a {
          font-size: 20px !important;
          text-align: left;
        }
        .es-menu td a {
          font-size: 14px !important;
        }
        .es-header-body p,
        .es-header-body ul li,
        .es-header-body ol li,
        .es-header-body a {
          font-size: 14px !important;
        }
        .es-content-body p,
        .es-content-body ul li,
        .es-content-body ol li,
        .es-content-body a {
          font-size: 14px !important;
        }
        .es-footer-body p,
        .es-footer-body ul li,
        .es-footer-body ol li,
        .es-footer-body a {
          font-size: 14px !important;
        }
        .es-infoblock p,
        .es-infoblock ul li,
        .es-infoblock ol li,
        .es-infoblock a {
          font-size: 12px !important;
        }
        *[class="gmail-fix"] {
          display: none !important;
        }
        .es-m-txt-c,
        .es-m-txt-c h1,
        .es-m-txt-c h2,
        .es-m-txt-c h3 {
          text-align: center !important;
        }
        .es-m-txt-r,
        .es-m-txt-r h1,
        .es-m-txt-r h2,
        .es-m-txt-r h3 {
          text-align: right !important;
        }
        .es-m-txt-l,
        .es-m-txt-l h1,
        .es-m-txt-l h2,
        .es-m-txt-l h3 {
          text-align: left !important;
        }
        .es-m-txt-r img,
        .es-m-txt-c img,
        .es-m-txt-l img {
          display: inline !important;
        }
        .es-button-border {
          display: inline-block !important;
        }
        a.es-button,
        button.es-button {
          font-size: 18px !important;
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
        .es-adapt-td {
          display: block !important;
          width: 100% !important;
        }
        .adapt-img {
          width: 100% !important;
          height: auto !important;
        }
        .es-m-p0 {
          padding: 0px !important;
        }
        .es-m-p0r {
          padding-right: 0px !important;
        }
        .es-m-p0l {
          padding-left: 0px !important;
        }
        .es-m-p0t {
          padding-top: 0px !important;
        }
        .es-m-p0b {
          padding-bottom: 0 !important;
        }
        .es-m-p20b {
          padding-bottom: 20px !important;
        }
        .es-mobile-hidden,
        .es-hidden {
          display: none !important;
        }
        tr.es-desk-hidden,
        td.es-desk-hidden,
        table.es-desk-hidden {
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
        table.es-social {
          display: inline-block !important;
        }
        table.es-social td {
          display: inline-block !important;
        }
        .es-desk-hidden {
          display: table-row !important;
          width: auto !important;
          overflow: visible !important;
          max-height: inherit !important;
        }
      }
      @media screen and (max-width: 384px) {
        .mail-message-content {
          width: 414px !important;
        }
      }
    </style>
  </head>
  <body
    style="
      width: 100%;
      font-family: arial, 'helvetica neue', helvetica, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      padding: 0;
      margin: 0;
    "
  >
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
                table-layout: fixed !important;
                width: 100%;
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
                          padding-bottom: 10px;
                          padding-top: 20px;
                          padding-left: 20px;
                          padding-right: 20px;
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
                                      href="https://viewstripo.email"
                                      style="
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
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
                                          border: 0;
                                          outline: none;
                                          text-decoration: none;
                                          -ms-interpolation-mode: bicubic;
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
                          padding-left: 20px;
                          padding-right: 20px;
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
                                        line-height: 53px;
                                        mso-line-height-rule: exactly;
                                        font-family: Orbitron, sans-serif;
                                        font-size: 44px;
                                        font-style: normal;
                                        font-weight: bold;
                                        color: #10054d;
                                      "
                                    >
                                      &nbsp;We got a request to reset
                                      your&nbsp;password
                                    </h1>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-bottom: 10px;
                                      padding-top: 15px;
                                      font-size: 0px;
                                    "
                                  >
                                    <a
                                      target="_blank"
                                      href="https://viewstripo.email"
                                      style="
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        text-decoration: underline;
                                        color: #26c6da;
                                        font-size: 14px;
                                      "
                                      ><img
                                        class="adapt-img"
                                        src="https://eezhzut.stripocdn.email/content/guids/CABINET_dee64413d6f071746857ca8c0f13d696/images/852converted_1x3.png"
                                        alt
                                        style="
                                          display: block;
                                          border: 0;
                                          outline: none;
                                          text-decoration: none;
                                          -ms-interpolation-mode: bicubic;
                                        "
                                        height="300"
                                        width="276"
                                    /></a>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      margin: 0;
                                      padding-top: 10px;
                                      padding-bottom: 10px;
                                      padding-left: 25px;
                                      padding-right: 30px;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue',
                                          helvetica, sans-serif;
                                        line-height: 21px;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      If you've lost your password or wish to
                                      reset it, use the link below to get
                                      started
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 15px;
                                      padding-bottom: 15px;
                                    "
                                  >
                                    <span
                                      class="es-button-border"
                                      style="
                                        border-style: solid;
                                        border-color: #26c6da;
                                        background: #26c6da;
                                        border-width: 4px;
                                        display: inline-block;
                                        border-radius: 10px;
                                        width: auto;
                                      "
                                      ><a
                                        href="${process.env.CLIENT_URL}/reset-password/${resetToken}"
                                        class="es-button"
                                        target="_blank"
                                        style="
                                          mso-style-priority: 100 !important;
                                          text-decoration: none;
                                          -webkit-text-size-adjust: none;
                                          -ms-text-size-adjust: none;
                                          mso-line-height-rule: exactly;
                                          color: #ffffff;
                                          font-size: 20px;
                                          padding: 10px 25px 10px 30px;
                                          display: inline-block;
                                          background: #26c6da;
                                          border-radius: 10px;
                                          font-family: arial, 'helvetica neue',
                                            helvetica, sans-serif;
                                          font-weight: normal;
                                          font-style: normal;
                                          line-height: 24px;
                                          width: auto;
                                          text-align: center;
                                          mso-padding-alt: 0;
                                          mso-border-alt: 10px solid #26c6da;
                                        "
                                      >
                                        Reset Your Password</a
                                      ></span
                                    >
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      margin: 0;
                                      padding-top: 10px;
                                      padding-bottom: 10px;
                                      padding-left: 25px;
                                      padding-right: 25px;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue',
                                          helvetica, sans-serif;
                                        line-height: 21px;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      If you did not request a password reset,
                                      you can safely ignore this email. Only a
                                      person with access to your email can reset
                                      your account password
                                    </p>
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

    res.status(200).json({ message: "Reset email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};

/* USER PROFILE PHOTO UPDATE*/
// const userProfilePhotoUpdate = async (req, res) => {
//   try {
//     let profilePhoto;
//     if (req.file) {
//       profilePhoto = req.file.filename;
//     }

//     const userDoc = await User.findById(req.user._id);
//     // Delete previous profile photo
//     if (userDoc.profilePhoto) {
//       const filePath = path.join("uploads", userDoc.profilePhoto);
//       fs.unlink(filePath, (err) => {
//         if (err) {
//           console.log("Error deleting previous profile photo:", err);
//         }
//       });
//     }

//     if (userDoc) {
//       userDoc.set({
//         profilePhoto,
//       });
//       await userDoc.save();
//       res.json("Photo uploaded");
//     } else {
//       res.status(404).json({ message: "User not found" });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ message: `Error occured ${error}` });
//   }
// };

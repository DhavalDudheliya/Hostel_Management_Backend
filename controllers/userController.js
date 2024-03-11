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
      // text: `You are receiving this email because you (or someone else) has requested to reset the password for your account.\n\n
      //   Please click on the following link to complete the process:\n\n
      //   ${process.env.CLIENT_URL}/reset-password/${resetToken}\n\n
      //   If you did not request this, please ignore this email, and your password will remain unchanged.\n`,
      html: `<!DOCTYPE html>

        <html
          lang="en"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:v="urn:schemas-microsoft-com:vml"
        >
          <head>
            <title></title>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <meta content="width=device-width, initial-scale=1.0" name="viewport" />
            <!--[if mso
              ]><xml
                ><o:OfficeDocumentSettings
                  ><o:PixelsPerInch>96</o:PixelsPerInch
                  ><o:AllowPNG /></o:OfficeDocumentSettings></xml
            ><![endif]-->
            <!--[if !mso]><!-->
            <!--<![endif]-->
            <style>
              * {
                box-sizing: border-box;
              }
        
              body {
                margin: 0;
                padding: 0;
              }
        
              a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: inherit !important;
              }
        
              #MessageViewBody a {
                color: inherit;
                text-decoration: none;
              }
        
              p {
                line-height: inherit;
              }
        
              .desktop_hide,
              .desktop_hide table {
                mso-hide: all;
                display: none;
                max-height: 0px;
                overflow: hidden;
              }
        
              .image_block img + div {
                display: none;
              }
        
              @media (max-width: 700px) {
                .image_block div.fullWidth {
                  max-width: 100% !important;
                }
        
                .mobile_hide {
                  display: none;
                }
        
                .row-content {
                  width: 100% !important;
                }
        
                .stack .column {
                  width: 100%;
                  display: block;
                }
        
                .mobile_hide {
                  min-height: 0;
                  max-height: 0;
                  max-width: 0;
                  overflow: hidden;
                  font-size: 0px;
                }
        
                .desktop_hide,
                .desktop_hide table {
                  display: table !important;
                  max-height: none !important;
                }
              }
            </style>
          </head>
        
          <body
            style="
              background-color: #fff0e3;
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: none;
              text-size-adjust: none;
            "
          >
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              class="nl-container"
              role="presentation"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background-color: #fff0e3;
              "
              width="100%"
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row row-1"
                      role="presentation"
                      style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="row-content stack"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                color: #000000;
                                width: 680px;
                                margin: 0 auto;
                              "
                              width="680"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    class="column column-1"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="100%"
                                  >
                                    <div
                                      class="spacer_block block-1"
                                      style="
                                        height: 30px;
                                        line-height: 30px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row row-2"
                      role="presentation"
                      style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="row-content stack"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                color: #000000;
                                width: 680px;
                                margin: 0 auto;
                              "
                              width="680"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    class="column column-1"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="33.333333333333336%"
                                  >
                                    <div
                                      class="spacer_block block-1"
                                      style="
                                        height: 0px;
                                        line-height: 0px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                  </td>
                                  <td
                                    class="column column-2"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="33.333333333333336%"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="image_block block-1"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                      width="100%"
                                    >
                                      <tr>
                                        <td
                                          class="pad"
                                          style="
                                            width: 100%;
                                            padding-right: 0px;
                                            padding-left: 0px;
                                          "
                                        >
                                          <div
                                            align="center"
                                            class="alignment"
                                            style="line-height: 10px"
                                          >
                                            <div style="max-width: 79.333px">

                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                  <td
                                    class="column column-3"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="33.333333333333336%"
                                  >
                                    <div
                                      class="spacer_block block-1"
                                      style="
                                        height: 0px;
                                        line-height: 0px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row row-3"
                      role="presentation"
                      style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="row-content stack"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                color: #000000;
                                width: 680px;
                                margin: 0 auto;
                              "
                              width="680"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    class="column column-1"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="100%"
                                  >
                                    <div
                                      class="spacer_block block-1"
                                      style="
                                        height: 10px;
                                        line-height: 10px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row row-4"
                      role="presentation"
                      style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="row-content stack"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                color: #000000;
                                width: 680px;
                                margin: 0 auto;
                              "
                              width="680"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    class="column column-1"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="100%"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="image_block block-1"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                      width="100%"
                                    >
                                      <tr>
                                        <td class="pad" style="width: 100%">
                                          <div
                                            align="center"
                                            class="alignment"
                                            style="line-height: 10px"
                                          >
                                            <div style="max-width: 680px">

                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row row-5"
                      role="presentation"
                      style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="row-content stack"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                background-color: #ffffff;
                                color: #000000;
                                width: 680px;
                                margin: 0 auto;
                              "
                              width="680"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    class="column column-1"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="100%"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="15"
                                      cellspacing="0"
                                      class="image_block block-1"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                      width="100%"
                                    >
                                      <tr>
                                        <td class="pad">
                                          <div
                                            align="center"
                                            class="alignment"
                                            style="line-height: 10px"
                                          >
                                            <div
                                              class="fullWidth"
                                              style="max-width: 374px"
                                            >

                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                    <div
                                      class="spacer_block block-2"
                                      style="
                                        height: 35px;
                                        line-height: 35px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="heading_block block-3"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                      width="100%"
                                    >
                                      <tr>
                                        <td
                                          class="pad"
                                          style="text-align: center; width: 100%"
                                        >
                                          <h1
                                            style="
                                              margin: 0;
                                              color: #101010;
                                              direction: ltr;
                                              font-family: Arial, Helvetica Neue,
                                                Helvetica, sans-serif;
                                              font-size: 27px;
                                              font-weight: normal;
                                              letter-spacing: normal;
                                              line-height: 120%;
                                              text-align: center;
                                              margin-top: 0;
                                              margin-bottom: 0;
                                              mso-line-height-alt: 32.4px;
                                            "
                                          >
                                            <strong>Forgot Your Password?</strong>
                                          </h1>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row row-6"
                      role="presentation"
                      style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="row-content stack"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                background-color: #ffffff;
                                color: #000000;
                                width: 680px;
                                margin: 0 auto;
                              "
                              width="680"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    class="column column-1"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="16.666666666666668%"
                                  >
                                    <div
                                      class="spacer_block block-1"
                                      style="
                                        height: 0px;
                                        line-height: 0px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                  </td>
                                  <td
                                    class="column column-2"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="66.66666666666667%"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="10"
                                      cellspacing="0"
                                      class="button_block block-1"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                      width="100%"
                                    >
                                      <tr>
                                        <td class="pad">
                                          <div align="center" class="alignment">
                                            <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="www.example.com" style="height:47px;width:158px;v-text-anchor:middle;" arcsize="10%" strokeweight="0.75pt" strokecolor="#101" fillcolor="#101">
        <w:anchorlock/>
        <v:textbox inset="0px,0px,0px,0px">
        <center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px">
        <!
                                            [endif]--><a
                                              href="${process.env.CLIENT_URL}/reset-password/${resetToken}"
                                              style="
                                                text-decoration: none;
                                                display: inline-block;
                                                color: #ffffff;
                                                background-color: #101;
                                                border-radius: 4px;
                                                width: auto;
                                                border-top: 1px solid #101;
                                                font-weight: undefined;
                                                border-right: 1px solid #101;
                                                border-bottom: 1px solid #101;
                                                border-left: 1px solid #101;
                                                padding-top: 5px;
                                                padding-bottom: 5px;
                                                font-family: Arial, Helvetica Neue,
                                                  Helvetica, sans-serif;
                                                font-size: 16px;
                                                text-align: center;
                                                mso-border-alt: none;
                                                word-break: keep-all;
                                              "
                                              target="_blank"
                                              ><span
                                                style="
                                                  padding-left: 20px;
                                                  padding-right: 20px;
                                                  font-size: 16px;
                                                  display: inline-block;
                                                  letter-spacing: normal;
                                                "
                                                ><span
                                                  style="
                                                    word-break: break-word;
                                                    line-height: 32px;
                                                  "
                                                  >Reset Password</span
                                                ></span
                                              ></a
                                            >><!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                    <div
                                      class="spacer_block block-2"
                                      style="
                                        height: 10px;
                                        line-height: 10px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="paragraph_block block-3"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        word-break: break-word;
                                      "
                                      width="100%"
                                    >
                                      <tr>
                                        <td
                                          class="pad"
                                          style="
                                            padding-bottom: 10px;
                                            padding-left: 20px;
                                            padding-right: 10px;
                                            padding-top: 10px;
                                          "
                                        >
                                          <div
                                            style="
                                              color: #848484;
                                              font-family: Arial, Helvetica Neue,
                                                Helvetica, sans-serif;
                                              font-size: 14px;
                                              line-height: 180%;
                                              text-align: center;
                                              mso-line-height-alt: 25.2px;
                                            "
                                          >
                                            <p
                                              style="margin: 0; word-break: break-word"
                                            >
                                              <span
                                                >Kindly ignore this email if you did not
                                                request for password reset</span
                                              >
                                            </p>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                    <div
                                      class="spacer_block block-4"
                                      style="
                                        height: 20px;
                                        line-height: 20px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                  </td>
                                  <td
                                    class="column column-3"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="16.666666666666668%"
                                  >
                                    <div
                                      class="spacer_block block-1"
                                      style="
                                        height: 0px;
                                        line-height: 0px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row row-7"
                      role="presentation"
                      style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="row-content stack"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                color: #000000;
                                width: 680px;
                                margin: 0 auto;
                              "
                              width="680"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    class="column column-1"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="100%"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="image_block block-1"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                      width="100%"
                                    >
                                      <tr>
                                        <td class="pad" style="width: 100%">
                                          <div
                                            align="center"
                                            class="alignment"
                                            style="line-height: 10px"
                                          >
                                            <div style="max-width: 680px">

                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row row-8"
                      role="presentation"
                      style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="row-content stack"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                color: #000000;
                                width: 680px;
                                margin: 0 auto;
                              "
                              width="680"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    class="column column-1"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="100%"
                                  >
                                    <div
                                      class="spacer_block block-1"
                                      style="
                                        height: 20px;
                                        line-height: 20px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row row-9"
                      role="presentation"
                      style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="row-content stack"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                color: #000000;
                                width: 680px;
                                margin: 0 auto;
                              "
                              width="680"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    class="column column-1"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="16.666666666666668%"
                                  >
                                    <div
                                      class="spacer_block block-1"
                                      style="
                                        height: 0px;
                                        line-height: 0px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                  </td>
                                  <td
                                    class="column column-2"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="66.66666666666667%"
                                  >
                                    <div
                                      class="spacer_block block-1"
                                      style="
                                        height: 35px;
                                        line-height: 35px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                  </td>
                                  <td
                                    class="column column-3"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="16.666666666666668%"
                                  >
                                    <div
                                      class="spacer_block block-1"
                                      style="
                                        height: 0px;
                                        line-height: 0px;
                                        font-size: 1px;
                                      "
                                    >
                                       
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row row-10"
                      role="presentation"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        background-color: #ffffff;
                      "
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="row-content stack"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                background-color: #ffffff;
                                color: #000000;
                                width: 680px;
                                margin: 0 auto;
                              "
                              width="680"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    class="column column-1"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      font-weight: 400;
                                      text-align: left;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      vertical-align: top;
                                      border-top: 0px;
                                      border-right: 0px;
                                      border-bottom: 0px;
                                      border-left: 0px;
                                    "
                                    width="100%"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="empty_block block-1"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                      width="100%"
                                    >
                                      <tr>
                                        <td class="pad">
                                          <div></div>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- End -->
          </body>
        </html>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Reset email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Internal server error" });
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

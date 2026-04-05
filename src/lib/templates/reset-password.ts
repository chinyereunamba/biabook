const resetPasswordTemplate = ({ name, link }: { name: string | undefined; link: string }) => {
  const emailHtml = /*html*/ `
      <!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <!--<![endif]-->
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
        <meta name="x-apple-disable-message-reformatting" />
        <link href="https://fonts.googleapis.com/css?family=Fira+Sans:ital,wght@0,300;0,400;0,500" rel="stylesheet" />
        <title>Reset Password</title>
        
        <style>
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 100% !important;
            width: 100% !important;
            -webkit-font-smoothing: antialiased;
          }
      
          * {
            -ms-text-size-adjust: 100%;
          }
      
          #outlook a {
            padding: 0;
          }
      
          .ReadMsgBody,
          .ExternalClass {
            width: 100%;
          }
      
          .ExternalClass,
          .ExternalClass p,
          .ExternalClass td,
          .ExternalClass div,
          .ExternalClass span,
          .ExternalClass font {
            line-height: 100%;
          }
      
          table,
          td,
          th {
            mso-table-lspace: 0 !important;
            mso-table-rspace: 0 !important;
            border-collapse: collapse;
          }
      
          u+.body table,
          u+.body td,
          u+.body th {
            will-change: transform;
          }
      
          body,
          td,
          th,
          p,
          div,
          li,
          a,
          span {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            mso-line-height-rule: exactly;
          }
      
          img {
            border: 0;
            outline: 0;
            line-height: 100%;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
          }
      
          .body .pc-project-body {
            background-color: transparent !important;
          }
      
          @media (min-width:621px) {
            .pc-lg-hide {
              display: none;
            }
      
            .pc-lg-bg-img-hide {
              background-image: none !important;
            }
          }
        </style>
        <style>
          @media (max-width:620px) {
            .pc-project-body {
              min-width: 0 !important;
            }
      
            .pc-project-container,
            .pc-component {
              width: 100% !important;
            }
      
            .pc-sm-hide {
              display: none !important;
            }
      
            .pc-sm-bg-img-hide {
              background-image: none !important;
            }
      
            .pc-w620-padding-35-35-35-35 {
              padding: 35px !important;
            }
      
            .pc-w620-itemsVSpacings-0 {
              padding-top: 0 !important;
              padding-bottom: 0 !important;
            }
      
            .pc-w620-itemsHSpacings-20 {
              padding-left: 10px !important;
              padding-right: 10px !important;
            }
      
            .pc-g-ib {
              display: inline-block !important;
            }
      
            .pc-g-b {
              display: block !important;
            }
      
            .pc-g-rb {
              display: block !important;
              width: auto !important;
            }
      
            .pc-g-wf {
              width: 100% !important;
            }
      
            .pc-g-rpt {
              padding-top: 0 !important;
            }
      
            .pc-g-rpr {
              padding-right: 0 !important;
            }
      
            .pc-g-rpb {
              padding-bottom: 0 !important;
            }
      
            .pc-g-rpl {
              padding-left: 0 !important;
            }
          }
      
          @media (max-width:520px) {
            .pc-w520-padding-30-30-30-30 {
              padding: 30px !important;
            }
          }
        </style><!--[if !mso]><!-- -->
        <style>
          @font-face {
            font-family: 'Fira Sans';
            font-style: normal;
            font-weight: 300;
            src: url('https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnPKreSBf8.woff') format('woff'), url('https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnPKreSBf6.woff2') format('woff2');
          }
      
          @font-face {
            font-family: 'Fira Sans';
            font-style: normal;
            font-weight: 400;
            src: url('https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5VvmYjN.woff') format('woff'), url('https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5VvmYjL.woff2') format('woff2');
          }
      
          @font-face {
            font-family: 'Fira Sans';
            font-style: normal;
            font-weight: 500;
            src: url('https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnZKveSBf8.woff') format('woff'), url('https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnZKveSBf6.woff2') format('woff2');
          }
        </style>
        <!--<![endif]--><!--[if mso]><style type="text/css">.pc-font-alt{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]--><!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
      </head>
      
      <body className="body pc-font-alt"
        style="width:100% !important;min-height:100% !important;margin:0 !important;padding:0 !important;mso-line-height-rule:exactly;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;font-variant-ligatures:normal;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;background-color:#f4f4f4"
        bgcolor="#f4f4f4">
        <table className="pc-project-body" style="table-layout:fixed;width:100%;min-width:600px;background-color:#f4f4f4"
          bgcolor="#f4f4f4" border="0" cellspacing="0" cellpadding="0" role="presentation">
          <tr>
            <td align="center" valign="top" style="width:auto">
              <table className="pc-project-container" align="center" border="0" cellpadding="0" cellspacing="0"
                role="presentation">
                <tr>
                  <td style="padding:20px 0" align="left" valign="top">
                    <table className="pc-component" style="width:600px;max-width:600px" width="600" align="center" border="0"
                      cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" className="pc-w520-padding-30-30-30-30 pc-w620-padding-35-35-35-35"
                          style="padding:40px;height:unset;background-color:#1B1B1B" bgcolor="#1B1B1B">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="top" style="padding:0 0 17px;height:auto">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"
                                  style="margin-right:auto;margin-left:auto">
                                  <tr>
                                    <td valign="top" align="center">
                                      <div className="pc-font-alt" style="text-decoration:none">
                                        <div
                                          style="font-size:16px;line-height:121%;text-align:center;text-align-last:center;color:#40be65;font-family:'Fira Sans',Arial,Helvetica,sans-serif;letter-spacing:-0.2px;font-style:normal">
                                          <div style="font-family:'Fira Sans',Arial,Helvetica,sans-serif"><span
                                              style="font-family:'Fira Sans',Arial,Helvetica,sans-serif;font-size:16px;line-height:121%;font-weight:500">Bi</span><span
                                              style="font-family:'Fira Sans',Arial,Helvetica,sans-serif;font-weight:500;font-size:16px;line-height:121%">a</span><span
                                              style="font-family:'Fira Sans',Arial,Helvetica,sans-serif;font-size:16px;line-height:121%;font-weight:500">Book</span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="top" style="padding:0 0 29px;height:auto">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                  <tr>
                                    <td valign="top" align="left">
                                      <div className="pc-font-alt" style="text-decoration:none">
                                        <div
                                          style="font-size:18px;line-height:156%;text-align:left;text-align-last:left;color:#fff;font-family:'Fira Sans',Arial,Helvetica,sans-serif;font-style:normal;letter-spacing:-0.2px">
                                          <div style="font-family:'Fira Sans',Arial,Helvetica,sans-serif"><span
                                              style="font-family:'Fira Sans',Arial,Helvetica,sans-serif;font-weight:300;font-size:18px;line-height:156%">Hi
                                              ${name ?? "there"}</span></div>
                                          <div style="font-family:'Fira Sans',Arial,Helvetica,sans-serif"><span
                                              style="font-family:'Fira Sans',Arial,Helvetica,sans-serif;font-weight:300;font-size:18px;line-height:156%">We
                                              received a request to reset your password for your BiaBook account. If you
                                              didn't make this request, you can safely ignore this email.</span></div>
                                          <div style="font-family:'Fira Sans',Arial,Helvetica,sans-serif"><span
                                              style="font-family:'Fira Sans',Arial,Helvetica,sans-serif;font-weight:300;font-size:18px;line-height:156%">To
                                              reset your password, click the button below:</span></div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                            style="min-width:100%">
                            <tr>
                              <th valign="top" align="center" style="text-align:center;font-weight:normal">
                                <!--[if mso]><table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse:separate;border-spacing:0;margin-right:auto;margin-left:auto"><tr><td valign="middle" align="center" style="border-radius:8px;background-color:#1595e7;text-align:center;color:#fff;padding:15px 17px;mso-padding-left-alt:0;margin-left:17px" bgcolor="#1595e7"><a className="pc-font-alt" style="display:inline-block;text-decoration:none;text-align:center" href="https://postcards.email/" target="_blank"><span style="font-size:16px;line-height:150%;color:#fff;font-family:'Fira Sans',Arial,Helvetica,sans-serif;letter-spacing:-0.2px;font-style:normal;display:inline-block;vertical-align:top"><span style="font-family:'Fira Sans',Arial,Helvetica,sans-serif;display:inline-block"><span style="font-family:'Fira Sans',Arial,Helvetica,sans-serif;font-size:16px;line-height:150%;font-weight:500">Reset p</span><span style="font-family:'Fira Sans',Arial,Helvetica,sans-serif;font-weight:500;font-size:16px;line-height:150%">assword</span></span></span></a></td></tr></table><![endif]--><!--[if !mso]><!-- --><a
                                  style="display:inline-block;box-sizing:border-box;border-radius:8px;background-color:#1595e7;padding:15px 17px;vertical-align:top;text-align:center;text-align-last:center;text-decoration:none;-webkit-text-size-adjust:none"
                                  href=${link} target="_blank"><span
                                    style="font-size:16px;line-height:150%;color:#fff;font-family:'Fira Sans',Arial,Helvetica,sans-serif;letter-spacing:-0.2px;font-style:normal;display:inline-block;vertical-align:top"><span
                                      style="font-family:'Fira Sans',Arial,Helvetica,sans-serif;display:inline-block"><span
                                        style="font-family:'Fira Sans',Arial,Helvetica,sans-serif;font-size:16px;line-height:150%;font-weight:500">Reset
                                        password</span></span></span></a><!--<![endif]-->
                              </th>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <table className="pc-component" style="width:600px;max-width:600px" width="600" align="center" border="0"
                      cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" className="pc-w520-padding-30-30-30-30 pc-w620-padding-35-35-35-35"
                          style="padding:40px;height:unset;background-color:#1b1b1b" bgcolor="#1b1b1b">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" style="padding:0 0 20px">
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td style="width:unset" valign="top">
                                      <table className="pc-width-hug" align="center" border="0" cellpadding="0" cellspacing="0"
                                        role="presentation">
                                        <tbody>
                                          <tr>
                                            <td className="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-0" valign="middle"
                                              style="padding-top:0;padding-bottom:0">
                                              <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                  <td align="center" valign="middle">
                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0"
                                                      role="presentation">
                                                      <tr>
                                                        <td align="center" valign="top" style="line-height:1px;font-size:1px">
                                                          <table align="center" border="0" cellpadding="0" cellspacing="0"
                                                            role="presentation">
                                                            <tr>
                                                              <td valign="top"><img
                                                                  src="https://cloudfilesdm.com/postcards/2249492905cbf066d1e2999ef53bc950.png"
                                                                  style="display:block;border:0;outline:0;line-height:100%;-ms-interpolation-mode:bicubic;width:20px;height:20px"
                                                                  width="20" height="20" alt="" /></td>
                                                            </tr>
                                                          </table>
                                                        </td>
                                                      </tr>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </table>
                                            </td>
                                            <td className="pc-w620-itemsHSpacings-20" valign="middle"
                                              style="padding-right:15px;padding-left:15px"></td>
                                            <td className="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-0" valign="middle"
                                              style="padding-top:0;padding-bottom:0">
                                              <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                  <td align="center" valign="middle">
                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0"
                                                      role="presentation">
                                                      <tr>
                                                        <td align="center" valign="top" style="line-height:1px;font-size:1px">
                                                          <table align="center" border="0" cellpadding="0" cellspacing="0"
                                                            role="presentation">
                                                            <tr>
                                                              <td valign="top"><img
                                                                  src="https://cloudfilesdm.com/postcards/ee4af7579ffc3dce51513f4dbea9247e.png"
                                                                  style="display:block;border:0;outline:0;line-height:100%;-ms-interpolation-mode:bicubic;width:20px;height:20px"
                                                                  width="20" height="20" alt="" /></td>
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
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="top" style="padding:0 0 14px;height:auto">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"
                                  style="margin-right:auto;margin-left:auto">
                                  <tr>
                                    <td valign="top" align="center">
                                      <div className="pc-font-alt"
                                        style="line-height:143%;letter-spacing:-0.2px;font-family:'Fira Sans',Arial,Helvetica,sans-serif;font-size:14px;font-weight:normal;color:#d8d8d8;text-align:center;text-align-last:center">
                                        King street, 2901 Marmara road, <br />New&zwnj;york, WA 98122&zwnj;-1090</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center">
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td style="width:unset" valign="top">
                                      <table className="pc-width-hug" align="center" border="0" cellpadding="0" cellspacing="0"
                                        role="presentation">
                                        <tbody>
                                          <tr>
                                            <td className="pc-g-rpt pc-g-rpb" valign="top" style="padding-top:0;padding-bottom:0">
                                              <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                  <td align="center" valign="top">
                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0"
                                                      role="presentation">
                                                      <tr>
                                                        <td align="center" valign="top">
                                                          <table border="0" cellpadding="0" cellspacing="0"
                                                            role="presentation" align="center">
                                                            <tr>
                                                              <td valign="top">
                                                                <div className="pc-font-alt"
                                                                  style="line-height:171%;letter-spacing:-0.2px;font-family:'Fira Sans',Arial,Helvetica,sans-serif;font-size:14px;font-weight:500;color:#1595e7">
                                                                  Unsubscribe</div>
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
                                        </tbody>
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
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td align="center" valign="top" style="padding-top:20px;padding-bottom:20px;vertical-align:top"><a
                            href="https://postcards.email/?uid=MzM2Njky&type=footer" target="_blank"
                            style="text-decoration:none;overflow:hidden;border-radius:2px;display:inline-block"><img
                              src="https://cloudfilesdm.com/postcards/promo-footer-dark.jpg" width="198" height="46"
                              alt="Made with (o -) postcards"
                              style="width:198px;height:auto;margin:0 auto;border:0;outline:0;line-height:100%;-ms-interpolation-mode:bicubic;vertical-align:top"></a><img
                            src="https://api-postcards.designmodo.com/tracking/mail/promo?uid=MzM2Njky" width="1" height="1"
                            alt="" style="display:none;width:1px;height:1px"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      
      </html>`
  return emailHtml;
}

export { resetPasswordTemplate }
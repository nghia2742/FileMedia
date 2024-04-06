const User = require("../models/User");
const { mongooseToObject } = require("../../util/mongoose");
const { convertSize } = require("../../util/tools");
const fs = require("fs");
const path = require("path");
const { nameExt, iconExt } = require("../../util/supportExt");
const archiver = require('archiver');


class FileController {
  //[GET] / main
  index(req, res) {
    if (req.signedCookies.UID) {
      User.findById(req.signedCookies.UID)
        .then((response) => {
          const user = mongooseToObject(response);
          const folderName = `${user._id}`;
          var folderPath = path.join("users", folderName);

          // Check Existed Folder?
          if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
          }

          //  Read folder
          fs.readdir(folderPath, (err, result) => {
            if (err) {
              console.error(err);
              return;
            }

            // Print all files and folders
            var files = result.filter((item) => item.includes("."));
            var folders = result.filter((item) => !item.includes("."));

            // Convert to Object
            var objFolders = folders.map((item) => {
              return {
                nameFolder: item,
                createAt: fs
                  .statSync(path.join(folderPath, item))
                  .birthtime.toLocaleDateString("vi-VN"),
                subFolderPath: item,
                downloadPath: path.join(folderPath, item),
              };
            });
            var objFiles = files.map((item) => {
              return {
                nameFile: item,
                iconExt: iconExt[item.split(".")[1]],
                type: nameExt[item.split(".")[1]],
                size: convertSize(
                  fs.statSync(path.join(folderPath, item)).size
                ),
                createAt: fs
                  .statSync(path.join(folderPath, item))
                  .birthtime.toLocaleDateString("vi-VN"),
                rootFile: path.join(folderName, item),
                downloadPath: path.join(folderPath, item),
              };
            });

            // -----------------------------------------
            // RENDER PAGE
            res.render("index", {
              user: user,
              folders: objFolders,
              files: objFiles,
            });
          });
        })
        .catch((err) => console.log(err));
    }
  }

  //[GET] /brand Folder
  directFolder(req, res) {
    if (req.signedCookies.UID) {
      User.findById(req.signedCookies.UID).then((response) => {
        const user = mongooseToObject(response);
        var query = req.query.myFolder;
        const folderName = `${user._id}`;
        var folderPath = path.join("users", folderName, query);

        //  Read folder
        fs.readdir(folderPath, (err, result) => {
          if (err) {
            res.render("error");
            return;
          }

          // Print all files and folders
          var files = result.filter((item) => item.includes("."));
          var folders = result.filter((item) => !item.includes("."));

          var subFolderPath = folders.map((e) => query + "/" + e);
          var breadcrumbItem = query.split("/");
          var breadcrumb = breadcrumbItem.map((e) => {
            return {
              breadcrumb_item: e,
              pathBreadcrumb: query.slice(0, query.indexOf(e)) + e,
            };
          });

          // Convert to Object
          var objFolders = folders.map((item, index) => {
            return {
              nameFolder: item,
              createAt: fs
                .statSync(path.join(folderPath, item))
                .birthtime.toLocaleDateString("vi-VN"),
              subFolderPath: subFolderPath[index],
              downloadPath: path.join(folderPath, item),
            };
          });
          var objFiles = files.map((item, index) => {
            return {
              nameFile: item,
              iconExt: iconExt[item.split(".")[1]],
              type: nameExt[item.split(".")[1]],
              size: convertSize(fs.statSync(path.join(folderPath, item)).size),
              createAt: fs
                .statSync(path.join(folderPath, item))
                .birthtime.toLocaleDateString("vi-VN"),
              rootFile: path.join(folderName, query, item),
              downloadPath: path.join(folderPath, item),
            };
          });

          // -----------------------------------------
          // RENDER PAGE
          res.render("index", {
            user: user,
            breadcrumb: breadcrumb,
            folders: objFolders,
            files: objFiles,
          });
        });
      });
    }
  }

  // [POST] CREATE
  createFile(req, res) {
    var fileName = req.body.newNameFile;
    if (fileName) {
      User.findById(req.signedCookies.UID).then((response) => {
        const user = mongooseToObject(response);
        const userFolder = `${user._id}`;
        var msg = "";
        var err = false;
        var folderPath = path.join("users/", userFolder, fileName);
        if (req.body.query) {
          var brandFolder = req.body.query;
          folderPath = path.join("users", userFolder, brandFolder, fileName);
        }
        if (!req.body.isFile) {
          //Check Existed Folder? Create it
          if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
            msg = "Tạo thư mục mới thành công";
          } else {
            err = true;
            msg = "Thư mục đã tồn tại";
          }
        } else {
          var contentFile = req.body.contentFile;
          if (!fs.existsSync(folderPath)) {
            fs.writeFile(folderPath, contentFile, (e) => {
              if (e) console.error(e);
            });
            msg = "Tạo file mới thành công";
          } else {
            err = true;
            msg = "File đã tồn tại";
          }
        }
        res.json({
          err: err,
          message: msg,
        });
      });
    }
  }

  //[POST] DELETE
  deleteFile(req, res) {
    var folderName = req.body.filenameDelete;
    if (folderName) {
      User.findById(req.signedCookies.UID).then((response) => {
        const user = mongooseToObject(response);
        const userFolder = `${user._id}`;
        var folderPath = path.join("users/", userFolder, folderName);
        if (req.body.query) {
          var brandFolder = req.body.query;
          folderPath = path.join("users", userFolder, brandFolder, folderName);
        }

        //Check Existed Folder? Create it
        if (fs.existsSync(folderPath)) {
          fs.rmSync(folderPath, { recursive: true });
        }

        var msg = "Xóa thành công";
        res.json({ message: msg });
      });
    }
  }

  renameFile(req, res) {
    var folderName = req.body.filenameRename;
    var newNameFile = req.body.newNameFile;
    if (folderName) {
      User.findById(req.signedCookies.UID).then((response) => {
        const user = mongooseToObject(response);
        const userFolder = `${user._id}`;
        var folderPath = path.join("users/", userFolder, folderName);
        var renameFolderPath = path.join("users/", userFolder, newNameFile);
        var msg = "";
        var err = false;
        if (req.body.query) {
          var brandFolder = req.body.query;
          folderPath = path.join("users", userFolder, brandFolder, folderName);
          renameFolderPath = path.join(
            "users/",
            userFolder,
            brandFolder,
            newNameFile
          );
        }
        //Check Existed Folder? Rename it
        if (fs.existsSync(folderPath)) {
          fs.renameSync(folderPath, renameFolderPath, (e) => {
            if (e) console.error(e);
          });
          msg = "Đổi tên thành công";
        } else {
          msg = "Đổi tên thất bại";
          err = true;
        }

        res.json({ err: err, message: msg });
      });
    }
  }

  //[GET] DOWNLOAD
  downloadFile(req, res) {
    var pathFile = req.query.file;
    var isFile = pathFile.includes(".");
    if (isFile) {
      res.download(pathFile);
      return;
    }

    const zipPath = "./archive.zip";
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Nén thư mục và ghi các tệp nén vào tệp .zip
    archive.directory(pathFile, false);
    archive.pipe(output);
    archive.finalize();

    // Đợi cho tệp .zip được hoàn thành và gửi tệp về cho người dùng
    output.on("close", () => {
      res.download(zipPath, (err) => {
        if (err) {
          console.error(err);
        } else {
          // Xóa tệp .zip tạm thời sau khi tải xuống thành công
          fs.unlinkSync(zipPath);
        }
      });
    });
  }

  //[POST] UPLOAD
  uploadFile(req, res) {
    res.json({
      message: 'Upload ok'
    });
  }
  
}

module.exports = new FileController();

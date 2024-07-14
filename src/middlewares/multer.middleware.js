import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {  // file - multer ke pass. req.body can handle jsondata but not files isley we had to install multer to handle files => basically ye req.files bhejta hai in addition w req.body
      cb(null, './public/temp') // where to save temp
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) // file ka name do
    }
  })
  
export const upload = multer({ 
    storage 
})

// basically apan multer se files lete haii apne server pr upload krte thennnn (aur req.files krne ke baad )cloufinary pr daal dete hai. simple h bc!

// we are taking the files from the user uploading in our local storage and then send it to cloudinary -> we do all this using multer
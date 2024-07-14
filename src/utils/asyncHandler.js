const asyncHandller = (reqHandler) => {
    return (req, res, next) =>{
        Promise
        .resolve(reqHandler(req, res, next))
        .catch( err => next(err))
    }
}

export default asyncHandller;


// const asyncHandller = (reqHandler)=>{
//     return async (req,res,next)=>{
//         try {
//             await reqHandler(req,res,next)
//             } catch (error) {
//                 res.status(error.code || 500).json({
//                     success:false,
//                     message: error.message
//                 })
//             }
//     }
// }
// export default asyncHandller;

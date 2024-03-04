const logger = (req,res,next) => {
    console.log('find path', req.path);
    next();
};

export default logger;
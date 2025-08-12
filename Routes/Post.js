const express = require('express');
const router = express.Router();
const authMiddleware = require('../MiddleWare/Auth');
const User = require('../Models/UserSchema');
const Post = require('../Models/PostSchema');
const multer = require('./multer');

router.get('/', (req, res) => {
    return res.send("post");
})


// post  Upload Post in db content Page
router.post(
    "/uploadpost",
    authMiddleware,
    multer.single("postimage"),
    async function (req, res, next) {
        const { title, description } = req.body;
        
        const { filename } = req.file;
        const user = await User.findById(req.user._id);
        const post = await Post.create({
            user: user._id,
            title: title,
            description: description,
            image: filename
        });
        user.posts.push(post._id);
        await user.save();

        res.redirect("profile");
    }
);

// always check you write enctype="multipart/form-data" in form
// Post Upload profile Page
router.post("/uploadfile", authMiddleware, multer.single("image"), async function (req, res, next) {
    const user = await User.findById(req.user._id);
    user.dp = req.file.filename;
    await user.save();
    res.redirect("profile");
}
);




// add page
router.get("/add", authMiddleware, async function (req, res, next) {
    const user = await User.findOne({ _id: req.user._id });
    res.render("add", { user: user, nav: true ,err:null});
});

router.get("/profile", authMiddleware, async function (req, res, next) {
    try {
        const user = await User
            .findById({ _id: req.user._id })
            .populate("posts");

        // if (!user) return res.redirect("/auth/login");
        res.render("profile", { user: user, nav: true });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});




// Get Feed Page
router.get("/feed", authMiddleware, async function (req, res, next) {
    try {
        const user = await User.findOne({ _id: req.user._id });
        const posts = await Post.find().populate("user");
        console.log(posts);
        if (posts.length <= 0)
            return res.render("feed", { err: "No Post Found", posts, nav: true });
        return res.render("feed", { posts, nav: true, err: null });

    } catch (err) {

        return res.render("feed", { posts: null, nav: true, err: err });
        // return res.status(500).json({msg:'Server Error'})    
    }
});

module.exports = router;
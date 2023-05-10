const UsersModel = require('../models/users')

const getLogin = (req, res) => {
    const userId = req.session.userId
    if (userId) {
        res.redirect('/')
    } else {
        res.render('login', {
            error: null
        })
    }
}

const postLogin = async (req, res) => {
    const username = req.body.username
    const pass = req.body.pass

    const dataUser = await UsersModel.findOne({
        user_name: username,
        password: pass
    })

    if (dataUser) {
        req.session.username
        req.session.pass
        req.session.userId = dataUser._id
        res.redirect('/')
    } else {
        res.render('login', {
            error: "Username hoặc mật khẩu không đúng "
        })
    }
}

const getRegister = (req, res) => {
    res.render('register', {
        error: null,
        message: null
    })
}

const postRegister = async (req, res) => {
    const user = {
        full_name: req.body.full_name,
        user_name: req.body.username,
        password: req.body.pass,
        re_pass: req.body.re_pass
    }

    if (!user.full_name || !user.user_name || !user.password || !user.re_pass) {
        return res.render('register', {
            error: "Không được để trống dữ liệu",
        })
    }

    if (user.password.length < 5) {
        return res.render('register', {
            error: "Mật khẩu phải từ 6 ký tự trở lên !",
        })
    }
    const checkUser = await UsersModel.findOne({
        user_name: user.user_name
    })
    try {
        if (!checkUser) {
            if (user.password === user.re_pass) {
                const createUser = new UsersModel({
                    full_name: user.full_name,
                    user_name: user.user_name,
                    password: user.password,
                    role: "admin"
                })
                const result = await createUser.save()
                if (result) {
                    req.session.username = result.user_name
                    req.session.pass = result.password
                    req.session.userId = result._id
                    res.render('register', {
                        error: null,
                        message: " Đăng ký thành công "
                    })
                }
            }
            else {
                return res.render('register', {
                    error: "Nhập lại mật khẩu không đúng !",
                })
            }
        } else {
            res.render('register', {
                error: "Username đã được sử dụng !!",
            })
        }
    } catch (error) {
        res.render('register', {
            error: error.message,
        })
    }
}

const getLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login')
    })
}
module.exports = {
    getLogin: getLogin,
    postLogin: postLogin,
    getLogout: getLogout,
    getLogin: getLogin,
    getRegister: getRegister,
    postRegister: postRegister
}
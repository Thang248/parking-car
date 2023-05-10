const UsersModel = require('../models/users');
const config = require('config');
const excel = require('exceljs');
const fs = require('fs');

const indexUser = async (req, res) => {
    const pagination = {
        page: Number(req.query.page) || 1,
        perPage: 5,
    }
    const noPage = (pagination.perPage * pagination.page) - pagination.perPage
    try {
        const users = await UsersModel.find().skip(noPage).limit(pagination.perPage);
        const countUsers = await UsersModel.countDocuments();
        res.render('account', {
            users: users,
            current: pagination.page,
            pages: Math.ceil(countUsers / pagination.perPage),
            namepage: "account"
        })
    } catch (error) {
        console.log(error);
    }
}  
const deleteUser = async (req, res) => {
    try {
        const user = await UsersModel.deleteOne({
            _id: req.params.id
        })
        res.redirect('/account')
    } catch (error) {
        console.log(error);
    }
}
const addUser = async (req, res) => {
    const users = await UsersModel.find()
    res.render('add_account', {
        users: users,
        error: null,
        message: null
    })
}
const newUser = async (req, res) => {
    const user = {
        full_name: req.body.full_name,
        user_name: req.body.username,
        password: req.body.pass,
    }
    try {
        const check = await UsersModel.findOne({user_name: user.user_name})
        if(!check) {
            const createUser = new UsersModel({
                full_name: user.full_name,
                user_name: user.user_name,
                password: user.password,
            })
            const saveUser = await createUser.save()
            res.redirect('/account')
        }
        else {
            res.redirect(req.originalUrl)
        }
    } catch (error) {
        res.render('add_account', {
            error: error.message,
            message: null,
        })
    }
}
const editUser = async (req, res) => {
    const user = await UsersModel.findOne({
        _id: req.params.id
    })
    res.render('edit_account', {
        user: user,
        error: null,
        message: null
    })
}

const updateUser = async (req, res) => {
    const user = {
        full_name: req.body.full_name,
        user_name: req.body.username,
        password: req.body.pass,
        role: req.body.role,
    }
    
    try {
        const update = await UsersModel.findByIdAndUpdate({
            _id: req.params.id
        }, {
            full_name: user.full_name,
            user_name: user.user_name,
            password: user.password,
        })
       
        res.redirect('/account')
    } catch (error) {
        res.render('edit_account', {
            error: error.message,
            message: null,
        })
    }

}
const exportEx = async (req, res) => {
    // Tạo workbook mới
    const workbook = new excel.Workbook();
    
    // Tạo worksheet mới
    const worksheet = workbook.addWorksheet('Data');
    worksheet.columns = [
        { header: 'Tên', key: 'name', width: 30 },
        { header: 'User_name', key: 'username', width: 50 },
        { header: 'Mật khẩu', key: 'password', width: 15 },
    ];
    try {
        UsersModel.find()
      .then(data => {
        data.forEach(item => {
          worksheet.addRow({
            name: item.full_name,
            username: item.user_name,
            password: item.password,
          });
        });
        
        // Lưu workbook ra file excel
        const filename = 'users.xlsx';
        workbook.xlsx.writeFile(filename)
          .then(() => {
            console.log(`Excel file "${filename}" has been created`);
            
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
      });
      res.redirect('/account')
    }
    catch (error) {
        res.render('account', {
            error: error.message,
            message: null,
        })
    }
}
module.exports = {
    indexUser: indexUser,
    deleteUser: deleteUser,
    addUser: addUser,
    newUser: newUser,
    editUser: editUser,
    updateUser: updateUser,
    exportEx: exportEx
}
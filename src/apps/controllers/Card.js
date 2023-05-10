const CardsModel = require('../models/cards');
const UsersModel = require('../models/users');
const moment = require('moment');
const excel = require('exceljs');


const indexCard = async (req, res) => {
    const pagination = {
        page: Number(req.query.page) || 1,
        perPage: 5,
    }
    const noPage = (pagination.perPage * pagination.page) - pagination.perPage
    try {
        const cards = await CardsModel.find().skip(noPage).limit(pagination.perPage);
        const countCards = await CardsModel.countDocuments()
        res.render('card', {
            cards: cards,
            error: null,
            massage: null,
            current: pagination.page,
            pages: Math.ceil(countCards / pagination.perPage),
            namepage: "card"
        })
    } catch (error) {
        console.log(error);
    }
}  
const addCards = async (req, res) => {
    const cards = await CardsModel.find()
    res.render('card', {
        cards: cards,
        error: null,
        message: null
    })
}

const newCards = async (req, res) => {
    const Card = {
        id: req.body.id_,
        full_name: req.body.full_name,
        role: req.body.role,
        status: req.body.is_active,
        license: req.body.license
    }
    try {
        const checkID = await CardsModel.findOne({id : Card.id})
        if(!checkID){
            const createCard = new CardsModel({
                full_name: "Khách vãng lai",
                id: Card.id,
                activeAt: null,
                role: "Khách hàng",
                license: null,
                status: false
            })
            const saveCard = await createCard.save();
            res.redirect('/card')

        }
        else {
            const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

            if(Card.status === "0") {
                const updateUser = await CardsModel.findOneAndUpdate({
                    id: Card.id
                }, {
                    full_name: Card.full_name,
                    role: Card.role,
                    status: Card.status,
                    license: Card.license,
                    activeAt: null,
                })
                if(updateUser) {
                    res.redirect('/card')
                }
            }
            else {
                const updateUser = await CardsModel.findOneAndUpdate({
                    id: Card.id
                }, {
                    full_name: Card.full_name,
                    role: Card.role,
                    status: Card.status,
                    activeAt: currentDateTime,
                    license: Card.license
                })
                if(updateUser) {
                    res.redirect('/card')
                }
            }
        }
    } catch (error) {
        return res.render('card', {
            error: error.message,
            message: null
        })
    }
}
const getRemoveCard = async (req, res) => {
    const cards = await CardsModel.find()
    res.render('card', {
        cards: cards,
        error: null,
        message: null
    })
}
const deleteCard = async (req, res) => {
    try {
        const check = await CardsModel.deleteOne({ id: req.body.id1 })
        if(check) {
            res.send("success");
            res.redirect('/card');
        }
        else {
            res.send("fail");
            res.redirect('/card');
        }
    } catch (error) {
        console.log(error);
    }
}
const exportEx = async (req, res) => {
    // Tạo workbook mới
    const workbook = new excel.Workbook();
    
    // Tạo worksheet mới
    const worksheet = workbook.addWorksheet('Data');
    worksheet.columns = [
        { header: 'Mã thẻ', key: 'id', width: 15 },
        { header: 'Tên', key: 'name', width: 30 },
        { header: 'Ngày kích hoạt', key: 'activeDate', width: 30 },
        { header: 'Loại thẻ', key: 'role', width: 15 },
        { header: 'Trạng thái', key: 'status', width: 30 }
    ];
    try {
        CardsModel.find()
      .then(data => {
        data.forEach(item => {
          worksheet.addRow({
            id: item.id,
            name: item.full_name,
            activeDate: item.activeAt,
            role: item.role,
            status: item.status.toString()
          });
        });
        
        // Lưu workbook ra file excel
        const filename = 'cards.xlsx';
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
      res.redirect('/card')
    }
    catch (error) {
        res.render('card', {
            error: error.message,
            message: null,
        })
    }
}

const checkCard = async(req, res) => {
    const cardId = req.body.cardId
    const parkingId = req.body.parkingId
    const imagePath = req.file.path
    if(cardId && parkingId && imagePath) {
       console.log("OK")
    }
    if(!cardId) {
        console.log("thiếu ID card")
    }
    if(!parkingId) {
        console.log("thiếu ID parking")
    }
    if(!imagePath) {
        console.log("Thiếu ảnh")
    }
}
module.exports = {
    indexCard: indexCard,
    addCards: addCards,
    newCards: newCards,
    deleteCard: deleteCard,
    getRemoveCard: getRemoveCard,
    exportEx: exportEx,
    checkCard: checkCard
}
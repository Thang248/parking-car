const CardsModel = require('../models/cards');
const VehiclesModel = require('../models/vehicle_management')
const ParksModel = require('../models/park_list')
const DevicesModel = require('../models/devices')
const axios = require('axios');
const fs = require('fs');
const mime = require('mime-types')
const moment = require('moment');
const path = require('path');


const indexVehicle = async (req, res) => {
    const pagination = {
        page: Number(req.query.page) || 1,
        perPage: 5,
    }
    const noPage = (pagination.perPage * pagination.page) - pagination.perPage
    try {
        const vehicles = await VehiclesModel.find().skip(noPage).limit(pagination.perPage).populate('card_id').populate('parking_id').sort({ updatedAt: -1 });
        const countVehicles = await VehiclesModel.countDocuments()
        const cards = await CardsModel.find()
        const parks = await ParksModel.find()
        res.render('car', {
            vehicles,
            cards,
            parks,
            error: null,
            massage: null,
            current: pagination.page,
            pages: Math.ceil(countVehicles / pagination.perPage),
            namepage: "car"
        })
    } catch (error) {
        console.log(error);
    }
}

// Hàm xóa tài liệu và ảnh
const deleteOldDocuments = async () => {
    try {
        // Đếm số lượng xe ra vào
        const countVehicles = await VehiclesModel.countDocuments();

        // Nếu số lượng xe ra vào vượt quá giới hạn
        if(countVehicles > 5) {
            const oldVehicles = await VehiclesModel.find().sort({ updatedAt: 1 }).limit(countVehicles - 5);
            oldVehicles.forEach(async (document) => {
                await VehiclesModel.findByIdAndDelete(document._id)

                // Xóa ảnh từ folder uploads
                const imagePathIn = `./src/apps${document.image_in}`;
                const imagePathOut = `./src/apps${document.image_out}`;

                fs.unlink(imagePathIn, (err) => {
                    if (err) {
                      console.error('Lỗi xóa ảnh vào:', err);
                    }
                  });
                fs.unlink(imagePathOut, (err) => {
                if (err) {
                    console.error('Lỗi xóa ảnh ra:', err);
                }
                });
            })

        }
        
    }
    catch(error) {
        console.error('Lỗi khi kiểm tra và xóa tài liệu cũ:', error);
    }
}

const checkApi = async(req, res) => {
    try {
        const cardId = req.body.cardId
        const deviceId = req.body.deviceId
        if(!cardId || !deviceId) {
            return res.status(500).json({
                message: "Thiếu dữ liệu"
            })
        }
        const uploadPath = './src/apps/uploads/'
        const card = await CardsModel.findOne({id: cardId})
        const device = await DevicesModel.findOne({id: deviceId})
        const park = await ParksModel.findById(device.parkId)
        if(!card) {
            const io = req.app.get('io');
            await io.emit('notification', cardId);
            return res.status(404).json({
                message: "Thông tin thẻ không hợp lệ"
            })
        }
        //Trường hợp xe vào
        if(card.is_parking === false) {
            const imageUrl = 'http://192.168.137.221:8292/capture?_cb=1:'
            const response = await axios({
                method: 'GET',
                url: imageUrl,
                responseType: 'stream'
            });
            // Tạo tên tệp bằng 1 id ngẫu nhiên
            const min = Math.pow(10, 9);  // 10^9: giá trị tối thiểu (1 chữ số)
            const max = Math.pow(10, 10) - 1;  // 10^10 - 1: giá trị tối đa (10 chữ số)
            
            const fileName = `${Math.floor(Math.random() * (max - min + 1)) + min}.jpg`;

            // Tạo một Write Stream để lưu ảnh
            const filePath = `${uploadPath}${fileName}`;
            const writer = fs.createWriteStream(filePath);

            // Lưu dữ liệu từ response vào file
            response.data.pipe(writer);
    
            

            if(card.full_name !== "Khách vãng lai") {
                ///// Trường hợp khách đã đăng kí nhưng chưa kích hoạt
                if(card.status === false) {
                    return res.status(401).json({
                        message: "Thẻ chưa được kích hoạt"
                    })
                }

                ///// Trường hợp khách đã đăng kí và đã kích hoạt
                else {
                    const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

                    const vehicle = await VehiclesModel.create({
                        image_in: `/uploads/${fileName}`,
                        image_out: null,
                        parking_id: park._id,
                        card_id: card._id,
                        timeIn: currentDateTime,
                        timeOut: null
                    })
                    await CardsModel.findOneAndUpdate({id: cardId}, {
                        is_parking: true
                    })
                    deleteOldDocuments()
                    res.status(200).json({
                        message: "Gửi xe thành công"
                    })
                }
            }
            ///// Trường hợp khách vãng lai
            else {
                const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

                const vehicle = await VehiclesModel.create({
                    image_in: `/uploads/${fileName}`,
                    image_out: null,
                    parking_id: park._id,
                    card_id: card._id,
                    timeIn: currentDateTime,
                    timeOut: null
                })
                await CardsModel.findOneAndUpdate({id: cardId}, {
                    is_parking: true
                })
                deleteOldDocuments()
                res.status(200).json({
                    message: "Gửi xe thành công"
                })
            }
        }
        // Trường hợp xe ra
        else {
            /// Lấy ảnh từ API xe ra
            const imageUrl = 'http://192.168.137.90:8292/capture?_cb=1:'
            const response = await axios({
                method: 'GET',
                url: imageUrl,
                responseType: 'stream'
            });
            // Tạo tên tệp bằng 1 id ngẫu nhiên
            const min = Math.pow(10, 9);  // 10^9: giá trị tối thiểu (1 chữ số)
            const max = Math.pow(10, 10) - 1;  // 10^10 - 1: giá trị tối đa (10 chữ số)
            
            const fileName = `${Math.floor(Math.random() * (max - min + 1)) + min}.jpg`;

            // Tạo một Write Stream để lưu ảnh
            const filePath = `${uploadPath}${fileName}`;
            const writer = fs.createWriteStream(filePath);

            // Lưu dữ liệu từ response vào file
            response.data.pipe(writer);

            const parkIn = await VehiclesModel.findOne({card_id: card._id}).sort({updatedAt: -1}).limit(1)
           
            ////Trường hợp xe vào ở bãi này nhưng ra ở bãi khác (VD gửi bãi 1 nhưng quẹt thẻ bãi 2)
            if(!parkIn.parking_id.equals(park._id)) {
                return res.status(500).json({
                    message: "Xe không được gửi ở bãi này"
                })
            }
            else {
                const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

                const vehicle = await VehiclesModel.findOneAndUpdate({card_id: card._id},{
                    image_out: `/uploads/${fileName}`,
                    timeOut: currentDateTime
                }, { sort: { updatedAt: -1 } })
                await CardsModel.findOneAndUpdate({id: cardId}, {
                    is_parking: false
                })
                deleteOldDocuments()

                res.status(200).json({
                    message: "Xe ra thành công"
                })
            }
        }
    }
    catch(error) {
        res.status(500).json({
            message: error.message
        })
    }

}


module.exports = {
    indexVehicle: indexVehicle,
    checkApi: checkApi
}
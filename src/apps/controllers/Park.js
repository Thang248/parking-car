const ParksModel = require('../models/park_list');
const DevicesModel = require('../models/devices');

const excel = require('exceljs');
const fs = require('fs');

const indexPark = async (req, res) => {
    const pagination = {
        page: Number(req.query.page) || 1,
        perPage: 5,
    }
    const noPage = (pagination.perPage * pagination.page) - pagination.perPage
    try {
        const parks = await ParksModel.find().skip(noPage).limit(pagination.perPage).populate('deviceId');
        const devices = await DevicesModel.find()
        const countParks = await ParksModel.countDocuments()
        res.render('parking-list', {
            park_list: parks,
            devices: devices,
            current: pagination.page,
            pages: Math.ceil(countParks / pagination.perPage),
            namepage: "parking-list"
        })
    } catch (error) {
        console.log(error);
    }
}  
const deletePark = async (req, res) => {
    try {
        const oldPark = await ParksModel.findById(req.params.id)

        if(oldPark.deviceId !== null) {
            const oldDevice = await DevicesModel.findByIdAndUpdate({_id: oldPark.deviceId}, {
                parkId: null,
                isActivate: false
            })
        }
        const park = await ParksModel.deleteOne({
            _id: req.params.id
        })
        res.redirect('/parking-list')
    } catch (error) {
        console.log(error);
    }
}
const addPark = async (req, res) => {
    const parks = await ParksModel.find()
    const devices = await DevicesModel.find()
    res.render('add_park', {
        parks: parks,
        devices: devices,
        error: null,
        message: null
    })
}
const newPark = async (req, res) => {
    const park = {
        parkId: req.body.id,
        name: req.body.name,
        address: req.body.address,
        deviceId: req.body.device_id
    }
    try {
        const checkName = await ParksModel.findOne({name: park.name})
        const checkCoSo = await ParksModel.findOne({address: park.address})
        const checkId = await ParksModel.findOne({parkId: park.parkId})
        
        if(!checkName && !checkCoSo && !checkId) {
            if(park.deviceId !== '0') {
                const createPark = new ParksModel({
                    parkId: park.parkId,
                    name: park.name,
                    address: park.address,
                    deviceId: park.deviceId
                })
                const savePark = await createPark.save()
                const device = await DevicesModel.findByIdAndUpdate({_id: createPark.deviceId}, {
                    parkId: createPark._id,
                    isActivate: true
                })
                res.redirect('/parking-list')
            }
            else {
                const createPark = new ParksModel({
                    parkId: park.parkId,
                    name: park.name,
                    address: park.address,
                    deviceId: null
                })
                const savePark = await createPark.save()
                res.redirect('/parking-list')
            }
        }
        else {
            res.redirect(req.originalUrl)
        }
    } catch (error) {
        console.log(error)
        res.redirect('/parking-list/add')
    }
}
const editPark = async (req, res) => {
    const park = await ParksModel.findOne({
        _id: req.params.id
    })
    const devices = await DevicesModel.find()
    res.render('edit_park', {
        park: park,
        devices,
        error: null,
        message: null
    })
}

const updatePark = async (req, res) => {
    const park = {
        parkId: req.body.id,
        name: req.body.name,
        address: req.body.address,
        deviceId: req.body.device_id
    }
    try {
        //Trường hợp không thay đổi thiết bị
        if(park.deviceId === '0') {
            const update = await ParksModel.findByIdAndUpdate({
                _id: req.params.id
            }, {
                parkId: park.parkId,
                name: park.name,
                address: park.address,
            })
            res.redirect('/parking-list')
        }
        //Trường hợp thay đổi thiết bị
        else {
            const oldPark = await ParksModel.findById(req.params.id)

            if(oldPark.deviceId !== null) {
                const oldDevice = await DevicesModel.findByIdAndUpdate({_id: oldPark.deviceId}, {
                    parkId: null,
                    isActivate: false
                })
            }
            const newDevice = await DevicesModel.findByIdAndUpdate({_id: park.deviceId}, {
                isActivate: true,
                parkId: oldPark._id
            })
            const update = await ParksModel.findByIdAndUpdate({
                _id: req.params.id
            }, {
                parkId: park.parkId,
                name: park.name,
                address: park.address,
                deviceId: park.deviceId
            })
           
            res.redirect('/parking-list')
        }

    } catch (error) {
        console.log(error)
        res.redirect(req.originalUrl)
    }

}

const exportEx = async (req, res) => {
    // Tạo workbook mới
    const workbook = new excel.Workbook();
    
    // Tạo worksheet mới
    const worksheet = workbook.addWorksheet('Data');
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Address', key: 'address', width: 50 }
    ];
    try {
        ParksModel.find()
      .then(data => {
        data.forEach(item => {
          worksheet.addRow({
            id: item.parkId,
            name: item.name,
            address: item.address
          });
        });
        
        // Lưu workbook ra file excel
        const filename = 'park-list.xlsx';
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
      res.redirect('/parking-list')
    }
    catch (error) {
        res.render('parking-list', {
            error: error.message,
            message: null,
        })
    }
}
module.exports = {
    indexPark: indexPark,
    deletePark: deletePark,
    addPark: addPark,
    newPark: newPark,
    editPark: editPark,
    updatePark: updatePark,
    exportEx: exportEx
}
const ParksModel = require('../models/park_list');
const DevicesModel = require('../models/devices')
const excel = require('exceljs');

const indexDevices = async (req, res) => {
    const pagination = {
        page: Number(req.query.page) || 1,
        perPage: 5,
    }
    const noPage = (pagination.perPage * pagination.page) - pagination.perPage
    try {
        const devices = await DevicesModel.find().skip(noPage).limit(pagination.perPage).populate('parkId')
        const parks = await ParksModel.find()
        const countDevices = await DevicesModel.countDocuments()
        res.render('device', {
            devices: devices,
            parks: parks,
            current: pagination.page,
            pages: Math.ceil(countDevices / pagination.perPage),
            namepage: "device"
        })
    } catch (error) {
        console.log(error)
    }
}  
const deleteDevice = async (req, res) => {
    try {
        const oldDevice = await DevicesModel.findById(req.params.id)
        if(oldDevice.parkId !== null) {
            const oldPark = await ParksModel.findByIdAndUpdate({_id: oldDevice.parkId},
                {
                    deviceId: null
                })
        }
        const device = await DevicesModel.deleteOne({
            _id: req.params.id
        })
        res.redirect('/device')
    } catch (error) {
        console.log(error);
    }
}
const addDevice = async (req, res) => {
    const devices = await DevicesModel.find()
    res.render('add_device', {
        devices: devices,
        error: null,
        message: null
    })
}
const newDevice = async (req, res) => {
    const device = {
        id: req.body.id,
        name: req.body.name,
    }
    try {
        const checkId = await DevicesModel.findOne({id: device.id})
        if(!checkId) {
            const createDevice = new DevicesModel({
                id: device.id,
                name: device.name,
                parkId: null,
                isActivate: false
            })
            const saveDevice = await createDevice.save()
            res.redirect('/device')
        }
        else {
            res.redirect(req.originalUrl)
        }
    } catch (error) {
         res.redirect('/device/add')
    }
}
const editDevice = async (req, res) => {
    const device = await DevicesModel.findOne({
        _id: req.params.id
    })
    res.render('edit_device', {
        device: device,
        error: null,
        message: null
    })
}

const updateDevice = async (req, res) => {
    const device = {
        id: req.body.id,
        name: req.body.name,
    }
    try {
        const update = await DevicesModel.findByIdAndUpdate({
            _id: req.params.id
        }, {
            id: device.id,
            name: device.name,
        })
       
        res.redirect('/device')
    } catch (error) {
        res.render('edit_device', {
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
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Address', key: 'address', width: 50 }
    ];
    try {
        DevicesModel.find()
      .then(data => {
        data.forEach(item => {
          worksheet.addRow({
            id: item.id,
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
    indexDevices: indexDevices,
    deleteDevice: deleteDevice,
    addDevice: addDevice,
    newDevice: newDevice,
    editDevice: editDevice,
    updateDevice: updateDevice,
    exportEx: exportEx
}
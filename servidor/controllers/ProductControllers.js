//importamos el modelo de la tabla de la base de satos
import ProductModel from "../models/ProductModel.js";

//importamos  productsStock y el poductMinStock, que son objetos para el sotck
import { productsStock, productMinStock } from "../index.js";

//importamos sendMail, que es una funcion que nos ayudara a enviar mensajes al correo
import { sendMail } from "../mail/mail.js";


//Funciones para los productos:

//mostrar todos los productos, recibe una peticion y devuelve una repuesta
export const getAllProducts = async (req,res) => {
    try {
        const products  = await ProductModel.findAll()
        res.json(products)
    } catch (error) {
        res.json({message: error.message})
    }
}

//mostrar un producto, //mostrar todos los productos, recibe una peticion y devuelve una repuesta
export const getProduct = async (req,res) => {
    try {
       const product = await ProductModel.findAll({
            where:{ id:req.params.id }
        })
        res.json(product[0])
    } catch (error) {
        res.json( {message: error.message} )
    }
}

// crear un producto, mostrar todos los productos, recibe una peticion y devuelve una repuesta
export const createProduct = async (req,res) => {
    try {
        await ProductModel.create(req.body)
        res.json({
            'message': 'registro creado'
        })
    } catch (error) {
        res.json( {message: error.message})
    }
}

//actualizar un producto mostrar un producto, recibe una peticion y devuelve una repuesta
export const updateProducts = async (req,res) =>{
    try {
        await ProductModel.update(req.body, {
            where: {id: req.params.id}
        })
        res.json({
            'message': 'registro actualizado'
        })
    } catch (error) {
        res.json( {message: error.message})
    }
}

//eliminar registro, mostrar todos los productos, recibe una peticion y devuelve una repuesta
export const deleteProduct = async (req,res) =>{
    try {
        await ProductModel.destroy(req.body, {
            where: {id: req.params.id}
        })
        res.json({
            'message': 'registro borrado'
        })
    } catch (error) {
        res.json( {message: error.message})
    }
}

//reservar o no reservar productos por medio de un click al carrito, recibe una peticion y devuelve una repuesta

export const bookProduct = async (req, res) => {
    try {
        console.log(productsStock);
        if (req.query.f === 'unbook'){
            productsStock[req.params.id]++;
            return res.json('Unbooked');
        } else if (req.query.f === 'book') {
            if (productsStock[req.params.id] == 0) return res.json('Stockout')//en caso de que el producto sea igual a 0 se notifica que se acabo
            productsStock[req.params.id]--;
            return res.json('Booked');
        } 
        res.status(400).json('Bad request');
    } catch (error) {
        res.json({message: error.message});
    }
}

//Se actualiza el contenido de la base de datos, recibiendo el producto y la cantidad
const updateContent = async (product, quantity) => {
    const stock = await ProductModel.findAll({
        attributes: ['id', 'stock', 'nombre'],
        where:{ id: product }
    })
    console.log(quantity);
    await ProductModel.update({stock: stock[0].dataValues.stock - quantity[product]}, {
        where: {id: product}
    })
    if (productMinStock[product].stockMin >= (stock[0].dataValues.stock - quantity[product])){console.log(stock[0].dataValues.stock);
        sendMail({nombre: product});
    }
}

//Se compran los productos y se usa updatecontent para actualizar el contenido de cada uno, recibe una peticion y devuelve una respuesta
export const buyProducts = async (req, res) => {
    try {
        console.log(typeof(req.body));
        Object.keys(req.body).forEach(product => updateContent(product, req.body));
        res.json("Successful purchase");
    } catch (error) {
        res.json(error.message);   
    }
}
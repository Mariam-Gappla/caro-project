const carBodySchema = new mongoose.Schema({
  name: { 
    en:{type: String, required: true },
    ar:{type: String, required: true }
},
}, { timestamps: true });

module.exports = mongoose.model("CarBody", carBodySchema);

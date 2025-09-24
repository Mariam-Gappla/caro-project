const cylinderSchema = new mongoose.Schema({
  name: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Cylinder", cylinderSchema);

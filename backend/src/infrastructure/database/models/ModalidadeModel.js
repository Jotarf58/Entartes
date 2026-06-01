const mongoose = require("mongoose");

const modalidadeSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true,
            trim: true,
            unique: true
        }
    },
    {
        timestamps: true
    }
);

modalidadeSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("Modalidade", modalidadeSchema);

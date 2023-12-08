import mongoose from "mongoose";

const TestSchema = mongoose.Schema({
    test: {
        type: String,
        required: [true, "please fill the test"]
    },
    test1: {
        type: Number,
        required: [true, "please fill the test"]
    }
});

const Test = mongoose.model("test", TestSchema);

export default Test;

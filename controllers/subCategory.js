const subCategorySchema = require("../validation/subCategoryValiditions");
const SubCategory = require("../models/subCategory");
const getSubCategories = async (req, res, next) => {
    try {
        const lang =req.headers["accept-language"] || "en";
        const categories = await SubCategory.find();
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang=="ar"?"تم جلب الاقسام بنجاح":"Categories fetched successfully",
            data: categories
        });
    }
    catch (error) {
        next(error);
    }
}
const addSubCategory = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "ar";
        const {subCategoryAr, subCategoryEn} = req.body;
        if(!subCategoryAr || !subCategoryEn){
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang=="ar"?"القسم الفرعى مطلوب عربى وانجليزى":"sub Category in Arabic and English is required"
            });
        }
        const category = await SubCategory.create({
            name: { ar: subCategoryAr, en: subCategoryEn },
            mainCategoryId: req.params.id
        });

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang=="ar"?"تم إضافة القسم بنجاح":"sub Category added successfully",
        });

    } catch (error) {
        next(error);
    }
};
const updateSubCategory = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "ar";

        const { error } = subCategorySchema(lang).validate({
            name: req.body.name
        });

        if (error) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: error.details[0].message
            });
        }

        const categoryId = req.params.id;
        console.log(categoryId)
        const category = await SubCategory.findById({ _id: categoryId });
        if (!category) {
            return res.status(400).send({
                status: false,
                code: 400,
                message:lang=="ar"? "القسم الفرعى غير موجود":"sub Category not found"
            });
        }
        const cat = await SubCategory.findByIdAndUpdate({ _id: categoryId }, { name: req.body.name }, { new: true });


        return res.status(200).send({
            status: true,
            code: 200,
            message: lang=="ar"?"تم تعديل القسم الفرعى بنجاح":"sub Category updated successfully",
            data: cat
        });

    } catch (error) {
        next(error);
    }
};
const deleteSubCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await SubCategory.findByIdAndDelete({ _id: categoryId });

        if (!category) {
            return res.status(400).send({
                status: false,
                code: 400,
                message:lang=="ar"? "القسم الفرعى غير موجود":"sub Category not found"
            });
        }

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang=="ar"?"تم حذف القسم الفرعى بنجاح":"sub Category deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};
const getSubCategoriesInMainCategory = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const id = req.params.id;
        const categories = await SubCategory.find({ mainCategoryId: id });
        const formatedCategories = categories.map(cat => {
            return {
                id: cat._id,
                name: lang == "ar" ? cat.name.ar : cat.name.en,
            }
        })
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "ar" ? "تم جلب الاقسام الفرعيه بنجاح" : "sub Categories fetched successfully",
            data: formatedCategories
        })
    }
    catch (error) {
        next(error)
    }
}

module.exports = {
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    getSubCategories,
    getSubCategoriesInMainCategory
}

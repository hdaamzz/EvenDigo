import { Schema, model } from 'mongoose';
import { ICoupon, DiscountType } from './interfaces/coupon.interface'; 

const couponSchema = new Schema<ICoupon>({
    couponCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        minlength: 3,
        maxlength: 20,
        match: /^[A-Z0-9]+$/
    },
    discountType: {
        type: String,
        required: true,
        enum: Object.values(DiscountType),
        default: DiscountType.PERCENTAGE
    },
    discount: {
        type: Number,
        required: true
    },
    minAmount: {
        type: Number,
        min: [0, 'Minimum amount must be a positive number'],
        default: 0
    },
    maxUses: {
        type: Number,
        min: [0, 'Max uses must be a non-negative number'],
        default: null
    },
    expiryDate: {
        type: Date,
        validate: {
            validator: function(value: Date) {
                return value ? value > new Date() : true;
            },
            message: 'Expiry date must be in the future'
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    isActive: {
        type: Boolean,
        default: true
    },
    currentUses: {
        type: Number,
        min: [0, 'Current uses cannot be negative'],
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for performance
couponSchema.index({ couponCode: 1, isActive: 1, expiryDate: 1 });

export const CouponModel = model<ICoupon>('Coupon', couponSchema);

export default CouponModel;
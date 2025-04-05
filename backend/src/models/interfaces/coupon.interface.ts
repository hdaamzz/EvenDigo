import { Document } from 'mongoose';

export enum DiscountType {
    PERCENTAGE = 'percentage',
    FIXED_AMOUNT = 'fixed_amount'
}

export interface ICoupon extends Document {
    couponCode: string;         
    discountType: DiscountType; 
    discount: number;           
    minAmount?: number;         
    maxUses?: number;           
    expiryDate?: Date;          
    description?: string;       
    isActive?: boolean;        
    currentUses?: number;      
}
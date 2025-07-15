const Bill = require("../Models/Bill");
const Item = require("../Models/Item");
const User = require("../Models/User");
const Notification = require("../Models/Notification");

const handleExchangeRequest = async (req, res) => {
    try {
        const { billId, items } = req.body;

        if (!billId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ msg: "billId and items are required." });
        }

        const userType = req.user.userType;
        const username = req.user.username;

        if (userType.toLowerCase() === "admin") {
            return res.status(403).json({ msg: "Admins cannot perform exchanges directly." });
        }

        const originalBill = await Bill.findById(billId);
        if (!originalBill) {
            return res.status(404).json({ msg: "Original bill not found." });
        }

        const userDoc = await User.findOne({ username });
        if (!userDoc) {
            return res.status(404).json({ msg: "User not found." });
        }

        let subTotal = 0;
        let totalAmount = 0;
        const exchangedItems = [];
        const exchangeHistory = [];

        for (const item of items) {
            const oldItem = item.originalItem;
            const oldQty = oldItem.quantity || oldItem.qty || 1; // Fallback to 1

            const oldItemDoc = await Item.findOne({ name: oldItem.name || oldItem.itemName });
            const newItemDoc = await Item.findOne({ name: item.newItemName });

            if (!oldItemDoc || !newItemDoc) {
                return res.status(404).json({ msg: `Item not found.` });
            }

            if (newItemDoc.stock < item.quantity) {
                return res.status(400).json({ msg: `Insufficient stock for ${item.newItemName}.` });
            }

            // Update stock
            oldItemDoc.stock += oldQty;
            newItemDoc.stock -= item.quantity;
            await oldItemDoc.save();
            await newItemDoc.save();

            const itemTotal = item.quantity * newItemDoc.salePrice;
            subTotal += itemTotal;
            totalAmount += itemTotal;

            exchangedItems.push({
                itemName: newItemDoc.name,
                quantity: item.quantity,
                price: newItemDoc.salePrice,
                salePrice: newItemDoc.salePrice,
            });

            exchangeHistory.push({
                oldItem: oldItem.name || oldItem.itemName,
                oldItemQuantity: oldItem.quantity,
                oldItemPrice: oldItemDoc.salePrice,
                newItem: newItemDoc.name,
                newItemQuantity: item.quantity,
                newItemPrice: newItemDoc.salePrice,
                quantity: item.quantity, // ✅ THIS FIXES THE VALIDATION ERROR
                reason: item.reason,
                difference:
                    (item.quantity * newItemDoc.salePrice) -
                    (oldItem.quantity * oldItemDoc.salePrice),
            });
        }

        const newBill = new Bill({
            customerName: originalBill.customerName,
            customerPhone: originalBill.customerPhone,
            customerEmail: originalBill.customerEmail,
            billNumber: `${originalBill.billNumber}-EX${Date.now()}`,
            billDate: new Date(),
            billTime: new Date().toLocaleTimeString(),
            items: exchangedItems,
            subTotal,
            totalAmount,
            paymentStatus: "Paid",
            paymentMethod: originalBill.paymentMethod,
            createdBy: userDoc._id,
            exchangeFrom: originalBill._id,
            exchanges: exchangeHistory,
        });

        await newBill.save();

        // ---------------------- 📢 NOTIFICATIONS ----------------------

        const messageLines = exchangeHistory.map(entry =>
            `${entry.oldItemQuantity} × ${entry.oldItem} @ ₹${entry.oldItemPrice} has been successfully exchanged with ${entry.newItemQuantity} × ${entry.newItem} @ ₹${entry.newItemPrice}`
        ).join("\n");

        const editorMessage = `${messageLines}\nFor Bill: ${originalBill.billNumber}\nCustomer: ${originalBill.customerName}`;
        const adminMessage = `Exchange by ${userDoc.username}:\n${messageLines}\nFor Bill: ${originalBill.billNumber}\nCustomer: ${originalBill.customerName}`;

        // Editor Notification
        await Notification.create({
            userId: userDoc._id,
            message: editorMessage,
            type: "exchange",
            link: `/exchanged-bill/${newBill._id}`,
            data: { billId: newBill._id },
        });

        // Admin Notifications (case-insensitive match)
        const admins = await User.find({ userType: { $regex: /^admin$/i } });

        if (admins.length > 0) {
            const adminNotifs = admins.map(admin => ({
                userId: admin._id,
                message: adminMessage,
                type: "exchange",
                link: `/exchanged-bill/${newBill._id}`,
                data: { billId: newBill._id },
            }));
            await Notification.insertMany(adminNotifs);
        } else {
            console.warn("⚠️ No admins found for exchange notification.");
        }

        return res.status(200).json({
            msg: "Exchange completed.",
            newBill,
        });

    } catch (err) {
        console.error("❌ Exchange Exception:", err);
        return res.status(500).json({ msg: "Server error during exchange." });
    }
};

module.exports = { handleExchangeRequest };

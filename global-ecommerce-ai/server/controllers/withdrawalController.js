const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");

// VENDOR - REQUEST WITHDRAWAL
const requestWithdrawal = async (
  req,
  res
) => {
  try {
    const { amount } = req.body;

    const vendor = await User.findById(
      req.user._id
    );

    if (
      !vendor ||
      vendor.walletBalance < amount
    ) {
      return res.status(400).json({
        message:
          "Insufficient wallet balance",
      });
    }

    const withdrawal =
      await Withdrawal.create({
        vendor: req.user._id,
        amount,
      });

    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// VENDOR - MY WITHDRAWALS
const getMyWithdrawals = async (
  req,
  res
) => {
  try {
    const withdrawals =
      await Withdrawal.find({
        vendor: req.user._id,
      }).sort({
        createdAt: -1,
      });

    res.status(200).json(
      withdrawals
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ADMIN - GET ALL WITHDRAWALS
const getAllWithdrawals = async (
  req,
  res
) => {
  try {
    const withdrawals =
      await Withdrawal.find()
        .populate(
          "vendor",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json(
      withdrawals
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ADMIN - APPROVE WITHDRAWAL
const approveWithdrawal = async (
  req,
  res
) => {
  try {
    const withdrawal =
      await Withdrawal.findById(
        req.params.id
      );

    if (!withdrawal) {
      return res.status(404).json({
        message:
          "Withdrawal not found",
      });
    }

    if (
      withdrawal.status !==
      "Pending"
    ) {
      return res.status(400).json({
        message:
          "Already processed",
      });
    }

    const vendor =
      await User.findById(
        withdrawal.vendor
      );

    if (
      !vendor ||
      vendor.walletBalance <
        withdrawal.amount
    ) {
      return res.status(400).json({
        message:
          "Insufficient balance",
      });
    }

    vendor.walletBalance -=
      withdrawal.amount;

    await vendor.save();

    withdrawal.status =
      "Approved";

    await withdrawal.save();

    res.status(200).json({
      message:
        "Withdrawal approved successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ADMIN - REJECT WITHDRAWAL
const rejectWithdrawal = async (
  req,
  res
) => {
  try {
    const withdrawal =
      await Withdrawal.findById(
        req.params.id
      );

    if (!withdrawal) {
      return res.status(404).json({
        message:
          "Withdrawal not found",
      });
    }

    withdrawal.status =
      "Rejected";

    await withdrawal.save();

    res.status(200).json({
      message:
        "Withdrawal rejected successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
};
import { Job } from "../models/job.model.js";
import mongoose from "mongoose";
import { Application } from "../models/application.model.js";

// Admin creates a job
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;
    const userId = req.id;

    // Check if all required fields are provided
    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "Something is missing.",
        success: false,
      });
    }

    // Ensure `requirements` is an array
    const formattedRequirements = Array.isArray(requirements)
      ? requirements
      : requirements.split(",");

    // Create job
    const job = await Job.create({
      title,
      description,
      requirements: formattedRequirements,
      salary: Number(salary),
      location,
      jobType,
      experienceLevel: Number(experience),
      position: Number(position),
      company: new mongoose.Types.ObjectId(companyId),
      created_by: new mongoose.Types.ObjectId(userId),
    });

    return res.status(201).json({
      message: "New job created successfully.",
      job,
      success: true,
    });
  } catch (error) {
    console.error(error); // Improved error handling
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

// Fetch all jobs for students with search functionality
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };

    // Populate `company` with specific fields
    const jobs = await Job.find(query)
      .populate({
        path: "company",
        select: "name location industry", // Added specific fields
      })
      .populate({
        path: "applications", // Added population of applications
        select: "status userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }

    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.error(error); // Improved error handling
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

// Fetch a job by ID
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Populate `company` and `applications` including user details
    const job = await Job.findById(jobId)
      .populate({
        path: "company",
        select: "name location industry", // Added specific fields
      })
      .populate({
        path: "applications",
        select: "status userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      });

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.error(error); // Improved error handling
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

// Fetch all jobs created by an admin
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;

    // Populate `company` and `applications`
    const jobs = await Job.find({ created_by: adminId })
      .populate({
        path: "company",
        select: "name location industry", // Added specific fields
      })
      .populate({
        path: "applications",
        select: "status userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }

    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.error(error); // Improved error handling
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

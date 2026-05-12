require('dotenv').config();
const mongoose = require('mongoose');
const MasterRole = require('./models/MasterRole');
const MasterContentType = require('./models/MasterContentType');
const MasterApprovalStatus = require('./models/MasterApprovalStatus');

const roles = [
    { role_code: 'ADMIN', role_description: 'Platform Administrator' },
    { role_code: 'HOST', role_description: 'Podcast Host / Uploader' },
    { role_code: 'LISTENER', role_description: 'Standard Listener' }
];

const contentTypes = [
    { type_code: 'MUSIC', type_description: 'Music' },
    { type_code: 'TRUE_CRIME', type_description: 'True Crime' },
    { type_code: 'COMEDY', type_description: 'Comedy' },
    { type_code: 'NEWS', type_description: 'News' },
    { type_code: 'HEALTH', type_description: 'Health' },
    { type_code: 'BUSINESS', type_description: 'Business' },
    { type_code: 'HISTORY', type_description: 'History' },
    { type_code: 'SELF_IMPROVEMENT', type_description: 'Self-improvement' },
    { type_code: 'SPORTS', type_description: 'Sports' },
    { type_code: 'STORYTELLING', type_description: 'Storytelling' },
    { type_code: 'RELIGION', type_description: 'Religion' },
    { type_code: 'DJ_MIXES', type_description: 'DJ Mixes' }
];

const approvalStatuses = [
    { approval_code: 'PENDING', approval_description: 'Awaiting Review' },
    { approval_code: 'APPROVED', approval_description: 'Approved and Published' },
    { approval_code: 'REJECTED', approval_description: 'Rejected by Admin' }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.DB_HOST);

        console.log('Clearing existing master data...');
        await MasterRole.deleteMany({});
        await MasterContentType.deleteMany({});
        await MasterApprovalStatus.deleteMany({});

        console.log('Seeding Roles...');
        await MasterRole.insertMany(roles);

        console.log('Seeding Content Types...');
        await MasterContentType.insertMany(contentTypes);

        console.log('Seeding Approval Statuses...');
        await MasterApprovalStatus.insertMany(approvalStatuses);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();

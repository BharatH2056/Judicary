const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Case = require('../models/Case');
const Judge = require('../models/Judge');
const Courtroom = require('../models/Courtroom');
const Hearing = require('../models/Hearing');
const Evidence = require('../models/Evidence');
const Party = require('../models/Party');
const Lawyer = require('../models/Lawyer');
const Verdict = require('../models/Verdict');
const CaseParty = require('../models/CaseParty');
const CaseLawyer = require('../models/CaseLawyer');

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Promise.all([
            Case.deleteMany(),
            Judge.deleteMany(),
            Courtroom.deleteMany(),
            Hearing.deleteMany(),
            Evidence.deleteMany(),
            Party.deleteMany(),
            Lawyer.deleteMany(),
            Verdict.deleteMany(),
            CaseParty.deleteMany(),
            CaseLawyer.deleteMany()
        ]);
        console.log('🗑️  Collections cleared');

        // 1. Insert Courtrooms
        const courtrooms = await Courtroom.insertMany([
            { room_id: 'CR-01', room_no: '101', floor: 1, capacity: 50, status: 'Available' },
            { room_id: 'CR-02', room_no: '202', floor: 2, capacity: 40, status: 'Available' },
            { room_id: 'CR-03', room_no: '303', floor: 3, capacity: 60, status: 'Available' }
        ]);
        console.log('✅ Courtrooms seeded');

        // 2. Insert Judges
        const judges = await Judge.insertMany([
            { judge_id: 'J-001', name: 'Hon. R. Verma', specialization: 'Criminal', experience_yrs: 18, courtroom_id: courtrooms[0]._id },
            { judge_id: 'J-002', name: 'Hon. S. Nair', specialization: 'Civil', experience_yrs: 12, courtroom_id: courtrooms[1]._id },
            { judge_id: 'J-003', name: 'Hon. P. Iyer', specialization: 'Family', experience_yrs: 9, courtroom_id: courtrooms[2]._id }
        ]);
        // Update Courtrooms with judge links
        await Promise.all([
            Courtroom.findByIdAndUpdate(courtrooms[0]._id, { judge_id: judges[0]._id }),
            Courtroom.findByIdAndUpdate(courtrooms[1]._id, { judge_id: judges[1]._id }),
            Courtroom.findByIdAndUpdate(courtrooms[2]._id, { judge_id: judges[2]._id })
        ]);
        console.log('✅ Judges seeded');

        // 3. Insert Cases
        const cases = await Case.insertMany([
            { case_id: 'C-1001', title: 'State v. Arjun Mehta', type: 'Criminal', status: 'Open', filing_date: new Date('2023-10-01') },
            { case_id: 'C-1002', title: 'Sharma v. Reliance Ltd', type: 'Civil', status: 'Pending', filing_date: new Date('2023-09-15') },
            { case_id: 'C-1003', title: 'Kumar v. State of KA', type: 'Criminal', status: 'Open', filing_date: new Date('2023-10-05') },
            { case_id: 'C-1004', title: 'Patel Estate Dispute', type: 'Civil', status: 'Closed', filing_date: new Date('2023-05-20') },
            { case_id: 'C-1005', title: 'State v. Ravi Shankar', type: 'Criminal', status: 'Closed', filing_date: new Date('2023-06-10') },
            { case_id: 'C-1006', title: 'Mehta v. Municipal Corp', type: 'Civil', status: 'Open', filing_date: new Date('2023-10-10') },
            { case_id: 'C-1007', title: 'Roy Custody Battle', type: 'Family', status: 'Pending', filing_date: new Date('2023-08-25') },
            { case_id: 'C-1008', title: 'State v. Priya Nair', type: 'Criminal', status: 'Closed', filing_date: new Date('2023-07-05') },
            { case_id: 'C-1009', title: 'Iyer Property Dispute', type: 'Civil', status: 'Open', filing_date: new Date('2023-10-12') },
            { case_id: 'C-1010', title: 'Verma v. Insurance Co', type: 'Corporate', status: 'Pending', filing_date: new Date('2023-09-20') }
        ]);
        console.log('✅ Cases seeded');

        // 4. Insert Hearings
        await Hearing.insertMany([
            { hearing_id: 'H-001', case_id: cases[0]._id, judge_id: judges[0]._id, courtroom_id: courtrooms[0]._id, date: new Date(), time: '10:00 AM' },
            { hearing_id: 'H-002', case_id: cases[1]._id, judge_id: judges[1]._id, courtroom_id: courtrooms[1]._id, date: new Date(), time: '11:30 AM' },
            { hearing_id: 'H-003', case_id: cases[2]._id, judge_id: judges[0]._id, courtroom_id: courtrooms[0]._id, date: new Date(Date.now() + 86400000), time: '02:00 PM' }
        ]);
        console.log('✅ Hearings seeded');

        // 5. Insert Lawyers
        const lawyers = await Lawyer.insertMany([
            { lawyer_id: 'L-001', name: 'Karan Mehra', bar_number: 'BAR123', specialization: 'Criminal', contact: '9876543210' },
            { lawyer_id: 'L-002', name: 'Sanjana Roy', bar_number: 'BAR456', specialization: 'Civil', contact: '8765432109' },
            { lawyer_id: 'L-003', name: 'Vikram Seth', bar_number: 'BAR789', specialization: 'Family', contact: '7654321098' }
        ]);
        console.log('✅ Lawyers seeded');

        // 6. Insert Parties
        const parties = await Party.insertMany([
            { party_id: 'P-001', name: 'Arjun Mehta', role: 'Defendant', contact: '1234567890' },
            { party_id: 'P-002', name: 'State of Maharashtra', role: 'Plaintiff' },
            { party_id: 'P-003', name: 'Aakash Sharma', role: 'Plaintiff', contact: '2345678901' },
            { party_id: 'P-004', name: 'Reliance Ltd', role: 'Defendant' }
        ]);
        console.log('✅ Parties seeded');

        // 7. Insert Verdicts (for closed cases)
        await Verdict.insertMany([
            { verdict_id: 'V-001', case_id: cases[3]._id, decision: 'Dismissed', penalty: 'None', verdict_date: new Date() },
            { verdict_id: 'V-002', case_id: cases[4]._id, decision: 'Guilty', penalty: 'Life Imprisonment', verdict_date: new Date() },
            { verdict_id: 'V-003', case_id: cases[7]._id, decision: 'Acquitted', penalty: 'None', verdict_date: new Date() }
        ]);
        console.log('✅ Verdicts seeded');

        // 8. Insert Evidence
        await Evidence.insertMany([
            { evidence_id: 'E-001', case_id: cases[0]._id, type: 'Document', description: 'Financial statements', submitted_by: 'Prosecution' },
            { evidence_id: 'E-002', case_id: cases[0]._id, type: 'Physical', description: 'Weapon found at scene', submitted_by: 'Police' },
            { evidence_id: 'E-003', case_id: cases[1]._id, type: 'Digital', description: 'Email thread records', submitted_by: 'Plaintiff' }
        ]);
        console.log('✅ Evidence seeded');

        // 9. Case-Party links
        await CaseParty.insertMany([
            { case_id: cases[0]._id, party_id: parties[0]._id, role_in_case: 'Main Accused' },
            { case_id: cases[0]._id, party_id: parties[1]._id, role_in_case: 'Prosecutor' },
            { case_id: cases[1]._id, party_id: parties[2]._id, role_in_case: 'Petitioner' }
        ]);
        console.log('✅ Case-Party links seeded');

        // 10. Case-Lawyer links
        await CaseLawyer.insertMany([
            { case_id: cases[0]._id, lawyer_id: lawyers[0]._id, side: 'Defense' },
            { case_id: cases[1]._id, lawyer_id: lawyers[1]._id, side: 'Prosecution' }
        ]);
        console.log('✅ Case-Lawyer links seeded');

        console.log('🌱 Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDatabase();

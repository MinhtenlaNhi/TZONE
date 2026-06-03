const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://pdquang050203_db_user:Quangpham%40123@tzone.hdlzzgu.mongodb.net/online_course_platform?retryWrites=true&w=majority').then(async () => {
  const Course = require('./server/src/models/Course');
  const User = require('./server/src/models/User');
  
  const courses = await Course.find();
  for (const c of courses) {
    // instructor string is like 'CT3101 - Hà Trang' or 'Lan Anh'
    let instructorName = c.instructor;
    if (instructorName.includes(' - ')) {
      instructorName = instructorName.split(' - ')[1].trim();
    } else {
      instructorName = instructorName.trim();
    }
    
    // Find the teacher by name
    const teacher = await User.findOne({ name: { $regex: new RegExp(instructorName, 'i') }, role: 'teacher' });
    if (teacher) {
      c.instructorRef = teacher._id;
      await c.save();
      console.log(`Updated course ${c.id} with teacher ${teacher.name}`);
    } else {
      console.log(`Teacher not found for course ${c.id} (name: ${instructorName})`);
    }
  }
  
  process.exit(0);
}).catch(console.error);

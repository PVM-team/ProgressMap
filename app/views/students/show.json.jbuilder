json.assignments @assignments, partial:'assignments/assignment', as: :assignment
json.course @course, partial:'courses/course', as: :course
json.student @student, partial:'students/student', as: :student
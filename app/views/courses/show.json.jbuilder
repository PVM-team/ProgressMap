json.course @course, partial:'courses/course', as: :course
json.students @students, partial:'students/student', as: :student
json.assignments @assignments, partial: 'assignments/assignment', as: :assignment
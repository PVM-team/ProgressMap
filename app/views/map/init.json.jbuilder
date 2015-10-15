json.course @course, partial:'courses/course', as: :course

json.current_student @current_student, partial:'students/student', as: :student

json.students @students, partial:'students/student', as: :student

json.assignments @assignments, partial: 'assignments/assignment', as: :assignment
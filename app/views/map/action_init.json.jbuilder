json.course @course, partial:'courses/course', as: :course

json.current_student @current_student, partial:'students/student', as: :student

json.students @students do |student|
	json.id student.id
	json.firstName student.firstName
	json.lastName student.lastName
  json.email student.email

	json.lastDoneAssignment student.last_done_assignment
end

json.assignments @assignments, partial: 'assignments/assignment', as: :assignment
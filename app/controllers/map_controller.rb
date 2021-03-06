class MapController < ApplicationController
	
	def action_init
		course = Course.find_by id: params[:course_id]
		student = Student.find_by id: params[:student_id]
		@course = []

		if course
			@course << course
			@assignments = course.assignments.order(:number)

			update_cache(course) if at_least_15_seconds_passed_since_cache_update

			@assignments_for_update = assignments_for_update_from_cache(course)
			@students = students_from_cache(course)
		end
	end


	def action_update
		course = Course.find_by id: params[:course_id]

		update_cache(course) if at_least_15_seconds_passed_since_cache_update

		@assignments_for_update = assignments_for_update_from_cache(course)
		@students = students_from_cache(course)
	end


	def init
		course = Course.find_by id: params[:course_id]
		@course = []

		if course
			@course << course
			@students = course.students
			@assignments = course.assignments.order(:number)
		end
	end

	private 

		def assignments_for_update_from_cache(course)
			Rails.cache.read(cache_key(course, "assignments_for_update"))
		end

		def students_from_cache(course)
			Rails.cache.read(cache_key(course, "students"))
		end

		def at_least_15_seconds_passed_since_cache_update
			return true unless session[:database_called]
			Time.now - 15 > session[:database_called]
		end

		def update_cache(course)
			Rails.cache.write(cache_key(course, "assignments_for_update"), assignments_for_update(course))
			Rails.cache.write(cache_key(course, "students"), course.students)
			session[:database_called] = Time.now
		end


		def assignments_for_update(course)
			assignments_for_update = []

			course.assignments.order(:number).each do |assignment|
				assignments_for_update << {'id': assignment.id, 'number': assignment.number, 'doers': assignment.doers}
			end

			assignments_for_update
		end

		def cache_key(course, string)
			course.name + course.id.to_s + string
		end
end
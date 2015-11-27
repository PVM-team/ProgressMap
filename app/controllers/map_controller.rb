class MapController < ApplicationController
	
	def action_init
		course = Course.find_by id: params[:course_id]
		student = Student.find_by id: params[:student_id]
		@course = []
		@current_student = []

		if course
			@course << course

			if at_least_20_seconds_passed_since_cache_update
				get_students_from_database_and_write_information_to_cache(course)
			
			else
				@students = Rails.cache.read(cache_key(course))
				get_students_from_database_and_write_information_to_cache(course) unless @students
			end

			@assignments = course.assignments.order(:number)
		end

		@current_student << student if student
	end


	def action_students

		if at_least_20_seconds_passed_since_cache_update
			course = Course.find_by id: params[:course_id]
			get_students_from_database_and_write_information_to_cache(course)
		
		else
			@students = Rails.cache.read(params[:course_name] + params[:course_id].to_s)
		end
	end


	def init
		course = Course.find_by id: params[:course_id]
		student = Student.find_by id: params[:student_id]
		@course = []
		@current_student = []

		if course
			@course << course
			@students = course.students
			@assignments = course.assignments.order(:number)
		end

		@current_student << student if student
	end

	private 

		def at_least_20_seconds_passed_since_cache_update
			return true unless session[:database_called]
			Time.now - 20 > session[:database_called]
		end

		def get_students_from_database_and_write_information_to_cache(course)
			@students = course.students

			Rails.cache.write(cache_key(course), @students)
			session[:database_called] = Time.now
		end

		# later on possible token or something similar
		def cache_key(course)
			course.name + course.id.to_s 
		end
end
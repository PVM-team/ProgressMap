class CoursesController < ApplicationController

	def create
		@course = Course.new(course_params)
		assignment_count = params[:assignment_count]

		begin
			validate_course_name
			validate_assignment_count(assignment_count)
		
		rescue ValidationError => e # What now?

		else	# Validations OK
			try_to_create_course(assignment_count)
		end

		render json: @course
	end

	private

		def course_params
			params.require(:course).permit(:name)
		end

		def validate_course_name
			raise ValidationError.new("Invalid course name: " + @course.name) if @course.name.length < 2
		end

		def validate_assignment_count(count)
			raise ValidationError.new("Invalid assignment count: " + count) if  count < 1 or count > 500
		end

		def try_to_create_course(count)
			
			if @course.save

				for i in 1..count
					assignment = Assignment.new number: i
					assignment.location = (Location.create x: i*25, y: i*25)

					@course.assignments << assignment
				end
			end
		end	
end
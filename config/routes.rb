Rails.application.routes.draw do

  root 'application#index'

  get 'map/init', to: 'map#init'
  get 'map/action_init', to: 'map#action_init'
  get 'students/all', to: 'students#all'

  put 'courses/edit_name', to: 'courses#edit_name'

  post 'assignments/decrease_numbers', to: 'assignments#decrease_numbers'
  post 'locations/move', to: 'locations#move'

  put 'students/add_to_course', to: 'students#add_to_course'
  put 'students/remove_from_course', to: 'students#remove_from_course'

  post 'students_tasks/destroy', to: 'students_tasks#destroy'
  post 'students_tasks/student_finished_task', to: 'students_tasks#student_finished_task'

  resources :assignments, only: [:create, :destroy]
  resources :courses, only: [:create, :show]
  resources :locations, only: [:update]
  resources :students, only: [:create, :show]
  resources :students_tasks, only: [:create]

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end

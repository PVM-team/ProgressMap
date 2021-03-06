Rails.application.routes.draw do

  root 'application#index'

  get 'map/init', to: 'map#init'
  get 'map/action_init', to: 'map#action_init'
  get 'map/action_update', to: 'map#action_update'

  put 'courses/edit_name', to: 'courses#edit_name'

  post 'assignments/decrease_numbers', to: 'assignments#decrease_numbers'
  post 'locations/move', to: 'locations#move'

  post 'students_tasks/update', to: 'students_tasks#update'

  post 'courses/create', to: 'courses#create_from_outside'                              # API call
  post 'students/create', to: 'students#create_from_outside'                            # API call

  resources :assignments, only: [:create, :destroy, :show, :update]
  resources :courses, only: [:create, :show]
  resources :teachers, only: [:create, :show]
  resources :locations, only: [:update]
  resources :students, only: [:create, :show, :destroy, :update]
  resources :students_tasks, only: [:create]                                            # create = API call
  resource :session, only: [:new, :create, :delete]

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

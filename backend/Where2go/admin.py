from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Group

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'groups')
    search_fields = ('username', 'email')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('email', 'first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('2FA Settings', {'fields': ('two_factor_secret', 'verification_code')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )

class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'admin', 'get_members_count')
    search_fields = ('name', 'admin__username')
    filter_horizontal = ('members',)
    
    def get_members_count(self, obj):
        return obj.members.count()
    get_members_count.short_description = 'Members Count'

    def save_model(self, request, obj, form, change):
        if not change:  # Если это новая группа
            obj.admin = request.user
        super().save_model(request, obj, form, change)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Group, GroupAdmin)

# Настройка заголовка админ-панели
admin.site.site_header = 'Where2Go Administration'
admin.site.site_title = 'Where2Go Admin Portal'
admin.site.index_title = 'Welcome to Where2Go Admin Portal'

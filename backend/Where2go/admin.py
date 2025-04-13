from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Group, Poll, PollOption

class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'username', 'email', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'groups')
    search_fields = ('id', 'username', 'email')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('id', 'username', 'password')}),
        ('Personal info', {'fields': ('email', 'first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('2FA Settings', {'fields': ('two_factor_secret', 'verification_code')}),
        ('Friends', {'fields': ('friends',)}),  # Добавляем секцию для друзей
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    readonly_fields = ('id',)
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )

class PollOptionInline(admin.TabularInline):
    model = Poll.options.through
    extra = 1
    verbose_name = 'Вариант ответа'
    verbose_name_plural = 'Варианты ответов'

class PollAdmin(admin.ModelAdmin):
    list_display = ('question', 'group', 'creator', 'created_at', 'end_time', 
                   'is_active', 'is_expired', 'get_votes_count')
    list_filter = ('is_active', 'group', 'creator', 'created_at')
    search_fields = ('question', 'group__name', 'creator__username')
    readonly_fields = ('created_at', 'total_votes', 'is_expired')
    inlines = [PollOptionInline]
    filter_horizontal = ('voted_users',)
    
    def get_votes_count(self, obj):
        return obj.total_votes
    get_votes_count.short_description = 'Всего голосов'

class PollOptionAdmin(admin.ModelAdmin):
    list_display = ('text', 'votes', 'get_polls')
    search_fields = ('text',)
    
    def get_polls(self, obj):
        return ", ".join([poll.question for poll in obj.polls.all()])
    get_polls.short_description = 'Опросы'

class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'admin', 'get_members_count', 'get_polls_count')
    search_fields = ('name', 'admin__username')
    filter_horizontal = ('members',)
    
    def get_members_count(self, obj):
        return obj.members.count()
    get_members_count.short_description = 'Количество участников'
    
    def get_polls_count(self, obj):
        return obj.polls.count()
    get_polls_count.short_description = 'Количество опросов'

    def save_model(self, request, obj, form, change):
        if not change:  # Если это новая группа
            obj.admin = request.user
        super().save_model(request, obj, form, change)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Group, GroupAdmin)
admin.site.register(Poll, PollAdmin)
admin.site.register(PollOption, PollOptionAdmin)

# Настройка заголовка админ-панели
admin.site.site_header = 'Where2Go Administration'
admin.site.site_title = 'Where2Go Admin Portal'
admin.site.index_title = 'Welcome to Where2Go Admin Portal'

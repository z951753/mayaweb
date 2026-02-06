// 主应用逻辑
class MayaResourceApp {
    constructor() {
        this.dataManager = dataManager;
        this.currentResource = null;
        this.init();
    }

    // 初始化应用
    init() {
        this.renderStatistics();
        this.renderCategories();
        this.renderResources();
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        // 搜索功能
        document.getElementById('search-btn').addEventListener('click', () => this.handleSearch());
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // 分类筛选
        document.getElementById('filter-category').addEventListener('change', () => this.renderResources());
        document.getElementById('sort-by').addEventListener('change', () => this.renderResources());

        // 添加资料表单
        document.getElementById('add-resource-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddResource();
        });

        // 添加分类按钮
        document.getElementById('add-category-btn').addEventListener('click', () => {
            document.getElementById('add-category-modal').classList.remove('hidden');
        });

        // 取消添加分类
        document.getElementById('cancel-category').addEventListener('click', () => {
            document.getElementById('add-category-modal').classList.add('hidden');
        });

        // 添加分类表单
        document.getElementById('add-category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddCategory();
        });

        // 关闭资料详情模态框
        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('resource-modal').classList.add('hidden');
        });
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            document.getElementById('resource-modal').classList.add('hidden');
        });

        // 编辑资料
        document.getElementById('edit-resource').addEventListener('click', () => this.handleEditResource());

        // 删除资料
        document.getElementById('delete-resource').addEventListener('click', () => this.handleDeleteResource());

        // 关闭编辑模态框
        document.getElementById('close-edit-modal').addEventListener('click', () => {
            document.getElementById('edit-modal').classList.add('hidden');
        });
        document.getElementById('cancel-edit').addEventListener('click', () => {
            document.getElementById('edit-modal').classList.add('hidden');
        });

        // 保存编辑
        document.getElementById('edit-resource-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaveEdit();
        });
    }

    // 渲染统计数据
    renderStatistics() {
        const stats = this.dataManager.getStatistics();
        document.getElementById('total-resources').textContent = stats.totalResources;
        document.getElementById('total-categories').textContent = stats.totalCategories;
        document.getElementById('total-favorites').textContent = stats.totalFavorites;
    }

    // 渲染分类
    renderCategories() {
        const categories = this.dataManager.getCategories();
        const container = document.getElementById('categories-container');
        const categorySelect = document.getElementById('resource-category');
        const editCategorySelect = document.getElementById('edit-category');
        const filterCategorySelect = document.getElementById('filter-category');

        // 清空现有内容
        container.innerHTML = '';
        categorySelect.innerHTML = '<option value="">选择分类</option>';
        editCategorySelect.innerHTML = '<option value="">选择分类</option>';

        // 添加分类到容器和选择框
        categories.forEach(category => {
            // 分类卡片
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow p-4 text-center card-hover';
            card.style.borderLeft = `4px solid ${category.color}`;
            card.innerHTML = `
                <h3 class="font-semibold mb-2">${category.name}</h3>
                <p class="text-sm text-gray-500">${this.dataManager.getResourcesByCategory(category.id).length} 个资料</p>
            `;
            card.addEventListener('click', () => {
                filterCategorySelect.value = category.id;
                this.renderResources();
            });
            container.appendChild(card);

            // 添加到分类选择框
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);

            // 添加到编辑分类选择框
            const editOption = document.createElement('option');
            editOption.value = category.id;
            editOption.textContent = category.name;
            editCategorySelect.appendChild(editOption);

            // 添加到筛选分类选择框
            if (!filterCategorySelect.querySelector(`option[value="${category.id}"]`)) {
                const filterOption = document.createElement('option');
                filterOption.value = category.id;
                filterOption.textContent = category.name;
                filterCategorySelect.appendChild(filterOption);
            }
        });
    }

    // 渲染资料
    renderResources() {
        const filterCategory = document.getElementById('filter-category').value;
        const sortBy = document.getElementById('sort-by').value;
        let resources = this.dataManager.getResources();

        // 筛选
        if (filterCategory !== 'all') {
            resources = resources.filter(r => r.category === filterCategory);
        }

        // 排序
        resources = this.dataManager.sortResources(sortBy);

        const container = document.getElementById('resources-container');
        container.innerHTML = '';

        if (resources.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fa fa-search text-gray-400 text-4xl mb-4"></i>
                    <p class="text-gray-500">暂无资料</p>
                </div>
            `;
            return;
        }

        // 渲染资料卡片
        resources.forEach(resource => {
            const category = this.dataManager.getCategoryById(resource.category);
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow overflow-hidden card-hover';
            card.innerHTML = `
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg">${resource.title}</h3>
                        <button class="favorite-btn text-gray-400 hover:text-yellow-500" data-id="${resource.id}">
                            <i class="fa ${resource.favorite ? 'fa-star' : 'fa-star-o'} text-xl"></i>
                        </button>
                    </div>
                    <div class="mb-3">
                        <span class="inline-block px-3 py-1 text-xs rounded-full" style="background-color: ${category?.color || '#3B82F6'}20; color: ${category?.color || '#3B82F6'}">
                            ${category?.name || '未分类'}
                        </span>
                        <span class="inline-block px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 ml-2">
                            ${this.getTypeLabel(resource.type)}
                        </span>
                        <span class="inline-block px-3 py-1 text-xs rounded-full ${this.getLevelClass(resource.level)}">
                            ${this.getLevelLabel(resource.level)}
                        </span>
                    </div>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">${resource.description}</p>
                    <div class="flex justify-between items-center">
                        <a href="${resource.link}" target="_blank" class="text-primary hover:underline text-sm flex items-center">
                            <i class="fa fa-external-link mr-1"></i> 查看
                        </a>
                        <button class="view-details-btn text-gray-600 hover:text-primary" data-id="${resource.id}">
                            <i class="fa fa-info-circle"></i> 详情
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // 绑定收藏按钮事件
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.dataManager.toggleFavorite(id);
                this.renderResources();
                this.renderStatistics();
            });
        });

        // 绑定详情按钮事件
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.showResourceDetails(id);
            });
        });
    }

    // 显示资料详情
    showResourceDetails(id) {
        const resource = this.dataManager.getResources().find(r => r.id === id);
        if (!resource) return;

        this.currentResource = resource;
        const category = this.dataManager.getCategoryById(resource.category);

        document.getElementById('modal-title').textContent = resource.title;
        document.getElementById('modal-content').innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">分类</p>
                    <p class="font-medium" style="color: ${category?.color || '#3B82F6'}">${category?.name || '未分类'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">类型</p>
                    <p class="font-medium">${this.getTypeLabel(resource.type)}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">难度等级</p>
                    <p class="font-medium ${this.getLevelClass(resource.level)}">${this.getLevelLabel(resource.level)}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">添加时间</p>
                    <p class="font-medium">${this.formatDate(resource.createdAt)}</p>
                </div>
            </div>
            <div>
                <p class="text-sm text-gray-500">描述</p>
                <p>${resource.description || '无描述'}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">链接/路径</p>
                <a href="${resource.link}" target="_blank" class="text-primary hover:underline">${resource.link}</a>
            </div>
            <div>
                <p class="text-sm text-gray-500">标签</p>
                <div class="flex flex-wrap gap-2">
                    ${resource.tags ? resource.tags.split(',').map(tag => `
                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">${tag.trim()}</span>
                    `).join('') : '无标签'}
                </div>
            </div>
        `;

        document.getElementById('resource-modal').classList.remove('hidden');
    }

    // 处理搜索
    handleSearch() {
        const query = document.getElementById('search-input').value.trim();
        if (!query) {
            this.renderResources();
            return;
        }

        const results = this.dataManager.searchResources(query);
        const container = document.getElementById('resources-container');
        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fa fa-search text-gray-400 text-4xl mb-4"></i>
                    <p class="text-gray-500">未找到相关资料</p>
                </div>
            `;
            return;
        }

        // 渲染搜索结果
        results.forEach(resource => {
            const category = this.dataManager.getCategoryById(resource.category);
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow overflow-hidden card-hover';
            card.innerHTML = `
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg">${resource.title}</h3>
                        <button class="favorite-btn text-gray-400 hover:text-yellow-500" data-id="${resource.id}">
                            <i class="fa ${resource.favorite ? 'fa-star' : 'fa-star-o'} text-xl"></i>
                        </button>
                    </div>
                    <div class="mb-3">
                        <span class="inline-block px-3 py-1 text-xs rounded-full" style="background-color: ${category?.color || '#3B82F6'}20; color: ${category?.color || '#3B82F6'}">
                            ${category?.name || '未分类'}
                        </span>
                        <span class="inline-block px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 ml-2">
                            ${this.getTypeLabel(resource.type)}
                        </span>
                    </div>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">${resource.description}</p>
                    <div class="flex justify-between items-center">
                        <a href="${resource.link}" target="_blank" class="text-primary hover:underline text-sm flex items-center">
                            <i class="fa fa-external-link mr-1"></i> 查看
                        </a>
                        <button class="view-details-btn text-gray-600 hover:text-primary" data-id="${resource.id}">
                            <i class="fa fa-info-circle"></i> 详情
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // 绑定事件
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.dataManager.toggleFavorite(id);
                this.handleSearch();
                this.renderStatistics();
            });
        });

        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.showResourceDetails(id);
            });
        });
    }

    // 处理添加分类
    handleAddCategory() {
        const name = document.getElementById('category-name').value.trim();
        const color = document.getElementById('category-color').value;

        if (!name) return;

        this.dataManager.addCategory({ name, color });
        this.renderCategories();
        this.renderStatistics();

        // 重置表单并关闭模态框
        document.getElementById('add-category-form').reset();
        document.getElementById('add-category-modal').classList.add('hidden');
    }

    // 处理添加资料
    handleAddResource() {
        const form = document.getElementById('add-resource-form');
        const resource = {
            title: document.getElementById('resource-title').value.trim(),
            category: document.getElementById('resource-category').value,
            type: document.getElementById('resource-type').value,
            level: document.getElementById('resource-level').value,
            description: document.getElementById('resource-description').value.trim(),
            link: document.getElementById('resource-link').value.trim(),
            tags: document.getElementById('resource-tags').value.trim()
        };

        if (!resource.title || !resource.category || !resource.type || !resource.level || !resource.link) {
            alert('请填写所有必填字段');
            return;
        }

        this.dataManager.addResource(resource);
        this.renderResources();
        this.renderStatistics();

        // 重置表单
        form.reset();
    }

    // 处理编辑资料
    handleEditResource() {
        if (!this.currentResource) return;

        document.getElementById('edit-resource-id').value = this.currentResource.id;
        document.getElementById('edit-title').value = this.currentResource.title;
        document.getElementById('edit-category').value = this.currentResource.category;
        document.getElementById('edit-type').value = this.currentResource.type;
        document.getElementById('edit-level').value = this.currentResource.level;
        document.getElementById('edit-description').value = this.currentResource.description;
        document.getElementById('edit-link').value = this.currentResource.link;
        document.getElementById('edit-tags').value = this.currentResource.tags;

        document.getElementById('resource-modal').classList.add('hidden');
        document.getElementById('edit-modal').classList.remove('hidden');
    }

    // 处理保存编辑
    handleSaveEdit() {
        const id = document.getElementById('edit-resource-id').value;
        const updatedResource = {
            title: document.getElementById('edit-title').value.trim(),
            category: document.getElementById('edit-category').value,
            type: document.getElementById('edit-type').value,
            level: document.getElementById('edit-level').value,
            description: document.getElementById('edit-description').value.trim(),
            link: document.getElementById('edit-link').value.trim(),
            tags: document.getElementById('edit-tags').value.trim()
        };

        if (!updatedResource.title || !updatedResource.category || !updatedResource.type || !updatedResource.level || !updatedResource.link) {
            alert('请填写所有必填字段');
            return;
        }

        this.dataManager.updateResource(id, updatedResource);
        this.renderResources();
        this.renderStatistics();

        // 关闭模态框
        document.getElementById('edit-modal').classList.add('hidden');
    }

    // 处理删除资料
    handleDeleteResource() {
        if (!this.currentResource) return;

        if (confirm('确定要删除这个资料吗？')) {
            this.dataManager.deleteResource(this.currentResource.id);
            this.renderResources();
            this.renderStatistics();
            document.getElementById('resource-modal').classList.add('hidden');
        }
    }

    // 获取类型标签
    getTypeLabel(type) {
        const types = {
            'video': '视频教程',
            'document': '文档资料',
            'project': '项目文件',
            'other': '其他资料'
        };
        return types[type] || type;
    }

    // 获取难度等级标签
    getLevelLabel(level) {
        const levels = {
            'beginner': '初级',
            'intermediate': '中级',
            'advanced': '高级'
        };
        return levels[level] || level;
    }

    // 获取难度等级样式
    getLevelClass(level) {
        const classes = {
            'beginner': 'text-green-600',
            'intermediate': 'text-blue-600',
            'advanced': 'text-purple-600'
        };
        return classes[level] || '';
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new MayaResourceApp();
});
// 数据管理
class DataManager {
    constructor() {
        this.categories = JSON.parse(localStorage.getItem('maya-categories')) || this.getDefaultCategories();
        this.resources = JSON.parse(localStorage.getItem('maya-resources')) || this.getDefaultResources();
        this.saveToLocalStorage();
    }

    // 默认分类
    getDefaultCategories() {
        return [
            { id: '1', name: '基础教程', color: '#3B82F6' },
            { id: '2', name: '角色动画', color: '#10B981' },
            { id: '3', name: '特效制作', color: '#8B5CF6' },
            { id: '4', name: '材质渲染', color: '#F59E0B' },
            { id: '5', name: '绑定技术', color: '#EC4899' },
            { id: '6', name: '项目案例', color: '#14B8A6' }
        ];
    }

    // 默认资料
    getDefaultResources() {
        return [
            {
                id: '1',
                title: 'Maya 2024基础入门教程',
                category: '1',
                type: 'video',
                level: 'beginner',
                description: '全面介绍Maya 2024的界面和基本操作，适合初学者',
                link: 'https://example.com/maya-basics',
                tags: '基础,入门,Maya 2024',
                favorite: false,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                title: '角色动画原理与实践',
                category: '2',
                type: 'document',
                level: 'intermediate',
                description: '详细讲解角色动画的基本原理和制作技巧',
                link: 'https://example.com/character-animation',
                tags: '角色动画,原理,实践',
                favorite: true,
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                title: '流体特效制作教程',
                category: '3',
                type: 'video',
                level: 'advanced',
                description: '学习如何使用Maya制作逼真的流体特效',
                link: 'https://example.com/fluid-effects',
                tags: '特效,流体,高级',
                favorite: false,
                createdAt: new Date().toISOString()
            }
        ];
    }

    // 保存到本地存储
    saveToLocalStorage() {
        localStorage.setItem('maya-categories', JSON.stringify(this.categories));
        localStorage.setItem('maya-resources', JSON.stringify(this.resources));
    }

    // 获取所有分类
    getCategories() {
        return this.categories;
    }

    // 获取所有资料
    getResources() {
        return this.resources;
    }

    // 根据分类获取资料
    getResourcesByCategory(categoryId) {
        return this.resources.filter(resource => resource.category === categoryId);
    }

    // 添加分类
    addCategory(category) {
        const newCategory = {
            id: Date.now().toString(),
            name: category.name,
            color: category.color
        };
        this.categories.push(newCategory);
        this.saveToLocalStorage();
        return newCategory;
    }

    // 添加资料
    addResource(resource) {
        const newResource = {
            id: Date.now().toString(),
            title: resource.title,
            category: resource.category,
            type: resource.type,
            level: resource.level,
            description: resource.description,
            link: resource.link,
            tags: resource.tags,
            favorite: false,
            createdAt: new Date().toISOString()
        };
        this.resources.push(newResource);
        this.saveToLocalStorage();
        return newResource;
    }

    // 更新资料
    updateResource(id, updatedResource) {
        const index = this.resources.findIndex(resource => resource.id === id);
        if (index !== -1) {
            this.resources[index] = {
                ...this.resources[index],
                ...updatedResource
            };
            this.saveToLocalStorage();
            return this.resources[index];
        }
        return null;
    }

    // 删除资料
    deleteResource(id) {
        this.resources = this.resources.filter(resource => resource.id !== id);
        this.saveToLocalStorage();
    }

    // 切换收藏状态
    toggleFavorite(id) {
        const resource = this.resources.find(r => r.id === id);
        if (resource) {
            resource.favorite = !resource.favorite;
            this.saveToLocalStorage();
            return resource.favorite;
        }
        return false;
    }

    // 搜索资料
    searchResources(query) {
        const lowerQuery = query.toLowerCase();
        return this.resources.filter(resource => {
            return (
                resource.title.toLowerCase().includes(lowerQuery) ||
                resource.description.toLowerCase().includes(lowerQuery) ||
                resource.tags.toLowerCase().includes(lowerQuery)
            );
        });
    }

    // 排序资料
    sortResources(sortBy) {
        const sorted = [...this.resources];
        switch (sortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'name-asc':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'name-desc':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            default:
                return sorted;
        }
    }

    // 获取统计数据
    getStatistics() {
        return {
            totalResources: this.resources.length,
            totalCategories: this.categories.length,
            totalFavorites: this.resources.filter(r => r.favorite).length
        };
    }

    // 获取分类信息
    getCategoryById(id) {
        return this.categories.find(category => category.id === id);
    }
}

// 初始化数据管理器
const dataManager = new DataManager();
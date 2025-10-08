import { useWordPressCategories } from '../../../hooks/useWordPressCategories';
import { useWordPressConfig } from '../../../hooks/useWordPressConfig';
import { useWordPressTags } from '../../../hooks/useWordPressTags';

export default function Sidebar() {
  const { categories } = useWordPressCategories();
  const { config } = useWordPressConfig();
  const { tags } = useWordPressTags();

  const author = config?.author || {
    name: 'Aqun',
    avatar: 'A',
    bio: 'ケーキ屋の社内エンジニア\n1989年11月1日生',
  };

  return (
    <aside className="space-y-6">
      {/* プロフィール */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h3 className="text-xl font-bold text-purple-800 mb-2">Aqun</h3>
          <p className="text-gray-600 text-sm mb-4">
            ケーキ屋の社内エンジニア<br />
            1989年11月1日生
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">
            プログラマ、花屋、医療従事者を経て現在のケーキ屋社内エンジニアとして活動。
            自己啓発とテクノロジーの融合を追求。
          </p>
        </div>
      </div>

      {/* カテゴリー */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
          <i className="ri-folder-line mr-2 text-yellow-500"></i>
          カテゴリー
        </h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/category/${category.id}`}
              className="flex items-center justify-between cursor-pointer hover:bg-purple-50 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <i className="ri-folder-line text-purple-600"></i>
                <span className="text-gray-700">{category.name}</span>
              </div>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                {category.count}
              </span>
            </a>
          ))}
        </div>
      </div>


      {/* タグクラウド */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
          <i className="ri-price-tag-3-line mr-2 text-yellow-500"></i>
          タグ
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 15).map((tag) => (
            <a
              key={tag.id}
              href={`/tag/${tag.id}`}
              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-purple-200 transition-colors"
            >
              #{tag.name}
            </a>
          ))}
        </div>
      </div>

      {/* ニュースレター */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-lg font-bold mb-3 flex items-center">
          <i className="ri-mail-line mr-2 text-yellow-400"></i>
          ニュースレター
        </h3>
        <p className="text-purple-100 text-sm mb-4">
          最新の投稿やアップデートをお届けします
        </p>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="メールアドレス"
            className="w-full px-4 py-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button className="w-full bg-yellow-500 text-purple-800 font-semibold py-2 rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer whitespace-nowrap">
            購読する
          </button>
        </div>
      </div>
    </aside>
  );
}
